import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { EntityManager, In, IsNull, LessThan, MoreThan } from "typeorm";
import redisClient from "../config/redis.js";
import { publishEvent } from "../config/rabbitmq.js";
import { sendMail } from "../config/mail.js";

// Repositories are obtained inside methods to ensure AppDataSource is initialized

export class BookingService {
  async checkOverlap(slotId: string, start: Date, end: Date): Promise<boolean> {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const overlap = await bookingRepo.findOne({
      where: {
        slotId,
        status: In(["pending", "confirmed"]),
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    return !!overlap;
  }

  async lockSlot(slotId: string) {
    const response = await axios.post(
      `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/lock`,
      {},
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );

    return response.data?.success === true;
  }

  async releaseSlot(slotId: string) {
    await axios.post(
      `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/release`,
      {},
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );
  }

  async releaseValet(valetId: string) {
    await axios.patch(
      `${process.env.RESOURCE_SERVICE_URL}/internal/valets/${valetId}/release`,
      {},
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );
  }

  async createBooking(bookingData: {
    userId: string;
    garageId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    amount: number;
    vehicleType: "sedan" | "suv";
    status?: string;
    valetRequested: boolean;
  }) {
    const idempotencyKey = `booking:idemp:${bookingData.userId}:${bookingData.slotId}:${bookingData.startTime.toISOString()}`;

    const idempotencyResult = await redisClient.set(
      idempotencyKey,
      "processing",
      { NX: true, EX: 60 },
    );

    if (!idempotencyResult) {
      const err = new Error("Duplicate booking request");
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

    const lockKey = `lock:slot:${bookingData.slotId}`;

    const lock = await redisClient.set(lockKey, "locked", { NX: true, EX: 30 });

    if (!lock) {
      const err = new Error("Slot is being booked by another request");
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

    try {
      const savedBooking = await AppDataSource.transaction(
        async (manager: EntityManager) => {
          const repo = manager.getRepository(Booking);

          const overlap = await repo.findOne({
            where: {
              slotId: bookingData.slotId,
              status: In(["pending", "confirmed", "payment_pending"]),
              startTime: LessThan(bookingData.endTime),
              endTime: MoreThan(bookingData.startTime),
            },
          });

          if (overlap) throw new Error("Slot already booked");

          function generatePin(): string {
            return Math.floor(1000 + Math.random() * 9000).toString();
          }

          const booking = repo.create({
            userId: bookingData.userId,
            garageId: bookingData.garageId,
            slotId: bookingData.slotId,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            amount: bookingData.amount,
            vehicleType: bookingData.vehicleType,
            status: "payment_pending",
            valetRequested: bookingData.valetRequested,
            valetStatus: bookingData.valetRequested
              ? BookingValetStatus.REQUESTED
              : BookingValetStatus.NONE,
            entryPin: generatePin(),
            exitPin: null,
            entryUsed: false,
            exitUsed: false,
          });

          const saved = await repo.save(booking);

          await this.lockSlot(saved.slotId);

          if (saved.valetRequested) {
            await publishEvent("valet.requested", {
              bookingId: saved.id,
              garageId: saved.garageId,
            });
          }

          return saved;
        },
      );

      await redisClient.set(idempotencyKey, "completed", { EX: 300 });

      await redisClient.del(`userBookings:${bookingData.userId}`);

      await publishEvent("booking.created", {
        bookingId: savedBooking.id,
        userId: savedBooking.userId,
        garageId: savedBooking.garageId,
        slotId: savedBooking.slotId,
        startTime: savedBooking.startTime,
        endTime: savedBooking.endTime,
      });

      const userRes = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/internal/users/${savedBooking.userId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      // console.log("auth url",process.env.AUTH_SERVICE_URL);
      console.log(
        "url:",
        `${process.env.AUTH_SERVICE_URL}/internal/users/${savedBooking.userId}`,
      );

      const user = userRes.data.data;

      const garageRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/garages/${savedBooking.garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const garage = garageRes.data.data;

      if (!garage.openingTime || !garage.closingTime) {
        throw new Error("Garage working hours not configured");
      }

      const start = new Date(bookingData.startTime);
      const end = new Date(bookingData.endTime);

      // Convert garage opening time into Date of same day
      const [openHour, openMin] = garage.openingTime.split(":").map(Number);
      const [closeHour, closeMin] = garage.closingTime.split(":").map(Number);

      const openingDateTime = new Date(start);
      openingDateTime.setHours(openHour, openMin, 0, 0);

      const closingDateTime = new Date(start);
      closingDateTime.setHours(closeHour, closeMin, 0, 0);

      if (start < openingDateTime || end > closingDateTime) {
        throw new Error("Garage is closed at this time");
      }

      if (start >= end) {
        throw new Error("Invalid booking time range");
      }
      const slotRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${savedBooking.slotId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const slot = slotRes.data.data;
      console.log("SLOT RESPONSE:", slotRes.data);
      const startTime = new Date(savedBooking.startTime).toLocaleString();
      const endTime = new Date(savedBooking.endTime).toLocaleString();

      const valetLine = savedBooking.valetRequested
        ? `Valet Service: Requested
Our valet partner will handle your vehicle pickup and parking. You will receive live status updates throughout the process.`
        : `Valet Service: Not requested
You may access your parking slot directly using your secure Entry PIN at the scheduled time.`;

      await sendMail(
        user.email,
        "Your Autospace Booking is Confirmed",
        `Dear ${user.fullname},

Thank you for choosing Autospace. Your parking reservation has been successfully confirmed. Below are your booking details:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${savedBooking.id}

Garage: ${garage.name}
Location: ${garage.locationName}

Floor: ${slot.floorNumber}
Slot Number: ${slot.slotNumber}

Vehicle Type: ${savedBooking.vehicleType}

Start Time: ${startTime}
End Time: ${endTime}

Amount Paid: ₹${savedBooking.amount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURE ACCESS INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entry PIN: ${savedBooking.entryPin}
Exit PIN: ${savedBooking.exitPin}

Please keep these PINs confidential. They are required to access and exit your parking slot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALET SERVICE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${valetLine}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you need any assistance, our support team is available to help you at any time.

Thank you for trusting Autospace for your parking needs.

Warm regards,  
Autospace Team  
Smart Parking. Seamless Experience.
`,
      );

      return savedBooking;
    } catch (err) {
      await redisClient.del(idempotencyKey);
      throw err;
    } finally {
      await redisClient.del(lockKey);
    }
  }

  async assignFirstValetRequest(booking: Booking, manager: EntityManager) {
    try {
      const response = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${booking.garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      const valet = response.data?.data;

      if (!valet) return null;

      booking.currentValetRequestId = valet.id;
      booking.rejectedValetIds = [];
      booking.valetStatus = BookingValetStatus.REQUESTED;

      return await manager.getRepository(Booking).save(booking);
    } catch {
      console.log("Valet assignment failed");
      return null;
    }
  }

  async rejectValetRequest(bookingId: string, valetId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.currentValetRequestId !== valetId)
      throw new Error("Not assigned valet");

    const rejected = booking.rejectedValetIds || [];

    if (!rejected.includes(valetId)) {
      rejected.push(valetId);
    }

    booking.rejectedValetIds = rejected;

    const response = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${booking.garageId}`,
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
        },
        params: {
          exclude: rejected.join(","),
        },
      },
    );

    const nextValet = response.data?.data;

    // NO MORE VALETS → MANAGER MANUAL ASSIGN REQUIRED
    if (!nextValet) {
      booking.currentValetRequestId = null;

      booking.valetStatus = BookingValetStatus.NONE;

      return await bookingRepo.save(booking);
    }

    // REQUEST NEXT VALET
    booking.currentValetRequestId = nextValet.id;

    booking.valetStatus = BookingValetStatus.REQUESTED;

    return await bookingRepo.save(booking);
  }
  async updateBookingWithValet(booking: Booking) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const updated = await bookingRepo.save(booking);

    // FIX: clear Redis cache
    await redisClient.del(`booking:${booking.id}`);
    await redisClient.del(`userBookings:${booking.userId}`);

    return updated;
  }

  async getBookingById(id: string) {
    const cacheKey = `booking:${id}`;

    //check Redis
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("Booking from Redis");
      return JSON.parse(cached);
    }

    //fetch from DB
    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id },
    });

    if (!booking) throw new Error("Booking not found");

    //store in Redis
    await redisClient.set(cacheKey, JSON.stringify(booking), { EX: 300 });

    console.log("Booking from DB");

    return booking;
  }

  async getManualAssignments(managerId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const garageRes = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/garages/manager/${managerId}`,
      {
        headers: {
          "x-user-id": managerId,
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );

    const garage = garageRes.data?.data;

    if (!garage) throw new Error("Garage not found");

    const garageId = garage.id;

    const bookings = await bookingRepo.find({
      where: {
        garageId,
        valetRequested: true,
        valetStatus: BookingValetStatus.NONE,
        currentValetRequestId: IsNull(),
      },
      order: {
        createdAt: "ASC",
      },
    });

    return bookings;
  }

  async getUserBookings(userId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const cacheKey = `userBookings:${userId}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("User bookings from Redis");
      return JSON.parse(cached);
    }

    const bookings = await bookingRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    await redisClient.set(cacheKey, JSON.stringify(bookings), { EX: 300 });

    return bookings;
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "payment_pending" && status === "confirmed") {
      console.log(
        "Skip status update — booking already finalized:",
        booking.id,
      );
      return booking;
    }

    booking.status = status;

    if (status === "occupied") {
      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/occupy`,
        {},
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );
    }

    if (status === "completed") {
      if (booking.valetId) {
        await this.releaseValet(booking.valetId);

        booking.valetStatus = BookingValetStatus.COMPLETED;
      }

      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/free`,
        {},
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );
    }

    const updated = await bookingRepo.save(booking);
    await redisClient.del(`booking:${bookingId}`);
    await redisClient.del(`userBookings:${booking.userId}`);

    return updated;
  }

  async deleteBooking(bookingId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    await this.releaseSlot(booking.slotId);

    if (booking.valetId) await this.releaseValet(booking.valetId);

    await bookingRepo.delete(bookingId);

    await redisClient.del(`booking:${bookingId}`);
    await redisClient.del(`userBookings:${booking.userId}`);

    return true;
  }

  async verifyOwnership(bookingId: string, userId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.userId !== userId) throw new Error("Forbidden");

    return booking;
  }

  // KEEP enrichBookings
  private async enrichBookings(bookings: Booking[]) {
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const headers = {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          };

          const userRes = await axios.get(
            `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`,
            { headers },
          );

          const garageRes = await axios.get(
            `${process.env.RESOURCE_SERVICE_URL}/internal/garages/${booking.garageId}`,
            { headers },
          );

          const slotRes = await axios.get(
            `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}`,
            { headers },
          );

          const user = userRes.data.data;
          const garage = garageRes.data.data;
          const slot = slotRes.data.data;

          return {
            id: booking.id,
            customerName: user.fullname,
            customerPhone: user.phone,
            garageName: garage.name,
            garageLocation: garage.locationName,
            floorNumber: slot.floorNumber,
            slotNumber: slot.slotNumber,
            slotType: slot.slotSize,
            entryPin: booking.entryPin,
            exitPin: booking.exitPin,
            pickupTime: booking.startTime,
            dropTime: booking.endTime,
            valetStatus: booking.valetStatus,
            createdAt: booking.createdAt,
          };
        } catch (err) {
          console.log("Enrich failed:", err);
          return null;
        }
      }),
    );

    return enrichedBookings.filter(Boolean);
  }

  async getValetRequests(valetId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const bookings = await bookingRepo.find({
      where: {
        currentValetRequestId: valetId,
        valetStatus: BookingValetStatus.REQUESTED,
      },
    });

    console.log("DB returned:", bookings);

    return await this.enrichBookings(bookings);
  }

  async getActiveJobs(valetId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const bookings = await bookingRepo.find({
      where: {
        valetId,
        valetStatus: BookingValetStatus.ASSIGNED,
      },
    });

    return await this.enrichBookings(bookings);
  }

  async getCompletedJobs(valetId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const bookings = await bookingRepo.find({
      where: {
        valetId,
        valetStatus: BookingValetStatus.COMPLETED,
      },
    });

    return await this.enrichBookings(bookings);
  }

  private async sendValetStatusEmail(booking: Booking) {
    const headers = {
      "x-user-id": "booking-service",
      "x-user-role": "SERVICE",
    };

    // fetch user
    const userRes = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`,
      { headers },
    );

    const user = userRes.data.data;

    // fetch garage
    const garageRes = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/garages/${booking.garageId}`,
      { headers },
    );

    const garage = garageRes.data.data;

    // fetch slot
    const slotRes = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/slots/${booking.slotId}`,
      { headers },
    );

    const slot = slotRes.data.data;

    // format dates
    const startTime = new Date(booking.startTime).toLocaleString();
    const endTime = new Date(booking.endTime).toLocaleString();

    // valet status message
    let statusTitle = "";
    let statusDescription = "";

    switch (booking.valetStatus) {
      case BookingValetStatus.ASSIGNED:
        statusTitle = "Valet Assigned";
        statusDescription =
          "Your professional Autospace valet has been successfully assigned and will handle your vehicle with utmost care.";
        break;

      case BookingValetStatus.ON_THE_WAY_TO_PICKUP:
        statusTitle = "Valet En Route";
        statusDescription =
          "Your valet is currently on the way to pick up your vehicle. Please be ready at the scheduled location.";
        break;

      case BookingValetStatus.PICKED_UP:
        statusTitle = "Vehicle Picked Up";
        statusDescription =
          "Your vehicle has been securely picked up and is being transported to your reserved parking space.";
        break;

      case BookingValetStatus.PARKED:
        statusTitle = "Vehicle Parked Successfully";
        statusDescription =
          "Your vehicle has been safely parked at your reserved Autospace slot.";
        break;

      case BookingValetStatus.ON_THE_WAY_TO_DROP:
        statusTitle = "Vehicle Returning";
        statusDescription =
          "Your valet is currently returning your vehicle. Please be ready to receive it.";
        break;

      case BookingValetStatus.COMPLETED:
        statusTitle = "Valet Service Completed";
        statusDescription =
          "Your valet service has been successfully completed. Thank you for trusting Autospace.";
        break;

      default:
        return;
    }

    await sendMail(
      user.email,
      `Autospace Update: ${statusTitle}`,
      `
Dear ${user.fullname},

We would like to inform you of an update regarding your valet booking with Autospace.

Status: ${statusTitle}

${statusDescription}

────────────────────────────
BOOKING DETAILS
────────────────────────────

Booking ID: ${booking.id}

Garage: ${garage.name}
Location: ${garage.locationName}

Floor: ${slot.floorNumber}
Slot Number: ${slot.slotNumber}

Vehicle Type: ${booking.vehicleType}

Start Time: ${startTime}
End Time: ${endTime}

Amount Paid: ₹${booking.amount}

Entry PIN: ${booking.entryPin ?? "N/A"}
Exit PIN: ${booking.exitPin ?? "N/A"}

────────────────────────────

You can track your valet and booking status anytime from your Autospace dashboard.

If you need assistance, our support team is always ready to help.

Thank you for choosing Autospace.

Warm regards,  
Autospace Team  
Smart Parking. Seamless Experience.
`,
    );
  }

  async updateValetStatus(bookingId: string, valetStatus: BookingValetStatus) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    booking.valetStatus = valetStatus;

    const updated = await bookingRepo.save(booking);

    await redisClient.del(`booking:${bookingId}`);
    await redisClient.del(`userBookings:${booking.userId}`);

    await this.sendValetStatusEmail(updated);

    return updated;
  }
}

export const bookingService = new BookingService();
