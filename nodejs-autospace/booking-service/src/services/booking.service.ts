import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { EntityManager, In, IsNull, LessThan, MoreThan } from "typeorm";
import redisClient from "../config/redis.js";
import { publishEvent } from "../config/rabbitmq.js";
import { sendMail } from "../config/mail.js";
import { calculateDistanceKm } from "../utils/distance.js";
import { ValidationError } from "../validators/booking.validator.js";

// Repositories are obtained inside methods to ensure AppDataSource is initialized

type GarageInternal = {
  name: string;
  locationName: string;
  latitude: number | string;
  longitude: number | string;
  valetServiceRadius: number;
};

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
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddress: string;
  }) {
    let garage: GarageInternal | null = null;

    if (bookingData.valetRequested) {
      const garageRes = await axios.get<{ data: GarageInternal }>(
        `${process.env.RESOURCE_SERVICE_URL}/internal/garages/${bookingData.garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      garage = garageRes.data.data;

      if (
        bookingData.pickupLatitude === undefined ||
        bookingData.pickupLongitude === undefined
      ) {
        throw new ValidationError("Pickup location required for valet");
      }

      const distance = calculateDistanceKm(
        Number(garage.latitude),
        Number(garage.longitude),
        bookingData.pickupLatitude,
        bookingData.pickupLongitude,
      );

      if (distance > garage.valetServiceRadius) {
        throw new ValidationError(
          `Pickup outside valet radius (${garage.valetServiceRadius} km)`,
        );
      }
    }

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
      // ---------------- PRICE RE-CALCULATION (SECURITY FIX) ----------------

      // Fetch slot details
      const slotResponse = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${bookingData.slotId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const slote = slotResponse.data.data;

      if (!slote) {
        throw new ValidationError("Invalid slot");
      }

      // Fetch garage pricing
      const garageRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/garages/${bookingData.garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const garageData = garageRes.data.data;

      if (!garageData) {
        throw new ValidationError("Invalid garage");
      }

      // Calculate duration (hours)
      const durationMs =
        bookingData.endTime.getTime() - bookingData.startTime.getTime();

      if (durationMs <= 0) {
        throw new ValidationError("Invalid booking duration");
      }

      const durationHours = parseFloat(
        (durationMs / (1000 * 60 * 60)).toFixed(2),
      );

      // Determine hourly price based on vehicle type
      let hourlyPrice = 0;

      if (bookingData.vehicleType === "sedan") {
        hourlyPrice = garageData.standardSlotPrice;
      } else {
        hourlyPrice = garageData.largeSlotPrice;
      }

      if (!hourlyPrice) {
        throw new ValidationError("Pricing not configured");
      }

      const subtotal = hourlyPrice * durationHours;

      // Valet charge (fixed or configurable)
      const valetCharge = bookingData.valetRequested ? 5 : 0;

      // Final total (rounded to 2 decimals)
      const computedTotal = parseFloat((subtotal + valetCharge).toFixed(2));

      // Optional: Detect tampering attempt
      if (bookingData.amount !== computedTotal) {
        console.warn(
          `⚠ Amount mismatch detected. Frontend: ${bookingData.amount}, Backend: ${computedTotal}`,
        );
      }

      // -----------------------------------------------------------------------

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
            amount: computedTotal,
            vehicleType: bookingData.vehicleType,
            valetRequested: bookingData.valetRequested,
            pickupLatitude: bookingData.pickupLatitude ?? null,
            pickupLongitude: bookingData.pickupLongitude ?? null,
            pickupAddress: bookingData.pickupAddress ?? null,
            status: "payment_pending",
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

      const user = userRes.data.data;

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

      const startTime = new Date(savedBooking.startTime).toLocaleString();
      const endTime = new Date(savedBooking.endTime).toLocaleString();

      const garageName = garage?.name ?? "N/A";
      const garageLocation = garage?.locationName ?? "N/A";

      const valetLine = savedBooking.valetRequested
        ? `Valet Service: Requested`
        : `Valet Service: Not requested`;

      await sendMail(
        user.email,
        "Booking Confirmation – Autospace",
        `Dear ${user.fullname},

Booking ID: ${savedBooking.id}
Garage: ${garageName}
Location: ${garageLocation}
Floor: ${slot.floorNumber}
Slot: ${slot.slotNumber}
Vehicle Type: ${savedBooking.vehicleType}
Start Time: ${startTime}
End Time: ${endTime}
Amount: $${savedBooking.amount}

${valetLine}

Autospace Team`,
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
    return await bookingRepo.save(booking);
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
            `${process.env.RESOURCE_SERVICE_URL}/internal/slots/${booking.slotId}`,
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
            slotNumber: slot.slotNumber,
            slotType: slot.slotSize,
            pickupTime: booking.startTime,
            dropTime: booking.endTime,
            createdAt: booking.createdAt,
            pickupAdress: booking.pickupAddress,
            pickupLatitude: booking.pickupLatitude,
            pickupLongitude: booking.pickupLongitude,
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
    const userRes = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`,
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
        },
      },
    );

    const user = userRes.data.data;

    let msg = "";

    switch (booking.valetStatus) {
      case BookingValetStatus.ASSIGNED:
        msg = "Your valet has been assigned.";
        break;

      case BookingValetStatus.ON_THE_WAY_TO_PICKUP:
        msg = "Your valet is on the way to pick up your vehicle.";
        break;

      case BookingValetStatus.PICKED_UP:
        msg = "Your vehicle has been picked up.";
        break;

      case BookingValetStatus.PARKED:
        msg = "Your vehicle has been parked safely.";
        break;

      case BookingValetStatus.ON_THE_WAY_TO_DROP:
        msg = "Your valet is returning your vehicle.";
        break;

      case BookingValetStatus.COMPLETED:
        msg = "Valet service completed.";
        break;

      default:
        return;
    }

    await sendMail(
      user.email,
      "Autospace Valet Update",
      `Dear ${user.fullname},

${msg}

Booking ID: ${booking.id}

Autospace Team`,
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
