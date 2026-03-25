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
  status: string;
};

type ValetInternal = {
  id: string;
  fullname?: string;
  phone?: string;
  email?: string;
  employmentStatus?: string;
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
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
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
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
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
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
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

      if (garageData.status !== "active") {
        throw new ValidationError("Garage is currently unavailable");
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
            pickupPin: bookingData.valetRequested ? generatePin() : null,
            pickupPinUsed: false,
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

      await redisClient.del(`userBookings:v2:${bookingData.userId}`);

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

      const garageName = garage?.name ?? "N/A";
      const garageLocation = garage?.locationName ?? "N/A";

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
Garage: ${garageName}
Location: ${garageLocation}
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

Please keep these PINs confidential. You will get Exit PIN in your app after entry. They are required to access and exit your parking slot.

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

      const saved = await bookingRepo.save(booking);

      // Clear cache so old valet's request list is invalidated immediately
      await redisClient.del(`booking:${bookingId}`);
      await redisClient.del(`userBookings:v2:${booking.userId}`);

      return saved;
    }

    // REQUEST NEXT VALET
    booking.currentValetRequestId = nextValet.id;
    booking.valetStatus = BookingValetStatus.REQUESTED;

    const saved = await bookingRepo.save(booking);

    // Clear cache so old valet's request list is invalidated immediately
    await redisClient.del(`booking:${bookingId}`);
    await redisClient.del(`userBookings:v2:${booking.userId}`);

    return saved;
  }
  async updateBookingWithValet(booking: Booking) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const updated = await bookingRepo.save(booking);

    // FIX: clear Redis cache
    await redisClient.del(`booking:${booking.id}`);
    await redisClient.del(`userBookings:v2:${booking.userId}`);

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
        status: In(["pending", "confirmed"]),
        valetRequested: true,
        valetStatus: BookingValetStatus.NONE,
        currentValetRequestId: IsNull(),
      },
      order: {
        createdAt: "ASC",
      },
    });

    let allAvailableValets: ValetInternal[] = [];
    try {
      const valetsRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/valets/all-active/${garageId}`,
        {
          headers: {
            "x-user-id": managerId,
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );
      allAvailableValets = valetsRes.data?.data || [];
    } catch (err) {
      console.error("Failed to fetch active valets", err);
    }

    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        let customer = {
          id: booking.userId,
          name: "Unknown",
          phone: "Unknown",
        };
        let slot = { id: booking.slotId, slotNumber: "N/A", slotType: "N/A" };

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
          if (userRes.data?.data) {
            customer = {
              id: booking.userId,
              name: userRes.data.data.fullname || "Unknown",
              phone: userRes.data.data.phone || "Unknown",
            };
          }

          const slotRes = await axios.get(
            `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}`,
            { headers },
          );
          if (slotRes.data?.data) {
            slot = {
              id: booking.slotId,
              slotNumber: slotRes.data.data.slotNumber,
              slotType: slotRes.data.data.slotSize,
            };
          }
        } catch (err) {
          console.error("Failed to enrich booking", booking.id, err);
        }

        const rejectedIds = booking.rejectedValetIds || [];
        const availableValets = allAvailableValets.filter(
          (v: ValetInternal) =>
            v.employmentStatus === "ACTIVE" && !rejectedIds.includes(v.id),
        );

        return {
          bookingId: booking.id,
          customer,
          garage: {
            id: garage.id,
            name: garage.name,
            location: garage.locationName,
          },
          slot,
          timing: {
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
          rejectedValetIds: rejectedIds,
          availableValets,
          createdAt: booking.createdAt,
        };
      }),
    );

    return enriched;
  }

  async getUserBookings(userId: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const cacheKey = `userBookings:v2:${userId}`;

    try {
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        const parsed: unknown = JSON.parse(cached);

        if (Array.isArray(parsed)) {
          const invalidCache = parsed.some(
            (b: unknown) =>
              typeof b !== "object" || b === null || !("slot" in b),
          );

          if (!invalidCache) {
            console.log("User bookings from Redis");
            return parsed;
          }

          console.log("Cache outdated — refreshing");
        }
      }

      const bookings = await bookingRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
      });

      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          let valet: unknown = null;
          let slot: { slotNumber: string; floorNumber: number } | null = null;

          /* ================= VALET ================= */

          if (booking.valetId) {
            try {
              const valetRes = await axios.get(
                `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.valetId}`,
                {
                  headers: {
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                  },
                },
              );

              valet = valetRes.data?.data ?? null;
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                console.error(
                  "Valet fetch failed:",
                  err.response?.status,
                  err.response?.data,
                );
              } else if (err instanceof Error) {
                console.error("Valet fetch error:", err.message);
              } else {
                console.error("Unknown valet error:", err);
              }
            }
          }

          /* ================= SLOT ================= */

          if (booking.slotId) {
            try {
              const slotRes = await axios.get(
                `${process.env.RESOURCE_SERVICE_URL}/internal/slots/${booking.slotId}`,
                {
                  headers: {
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                  },
                },
              );

              const slotData = slotRes.data?.data;

              if (slotData) {
                slot = {
                  slotNumber: slotData.slotNumber,
                  floorNumber: slotData.floorNumber,
                };
              }
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                console.error(
                  "Slot fetch failed:",
                  booking.slotId,
                  err.response?.status,
                  err.response?.data,
                );
              } else if (err instanceof Error) {
                console.error("Slot fetch error:", err.message);
              } else {
                console.error("Unknown slot error:", err);
              }
            }
          }

          return {
            ...booking,
            valet,
            slot,
          };
        }),
      );

      await redisClient.set(cacheKey, JSON.stringify(enriched), { EX: 300 });

      return enriched;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("getUserBookings failed:", err.message);
      } else {
        console.error("getUserBookings failed:", err);
      }

      throw err;
    }
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
    await redisClient.del(`userBookings:v2:${booking.userId}`);

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
    await redisClient.del(`userBookings:v2:${booking.userId}`);

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
            pickupPin: booking.pickupPin ?? null,
            pickupTime: booking.startTime,
            dropTime: booking.endTime,
            valetStatus: booking.valetStatus,
            createdAt: booking.createdAt,
            pickupAddress: booking.pickupAddress,
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
        valetStatus: In([
          BookingValetStatus.ASSIGNED,
          BookingValetStatus.ON_THE_WAY_TO_PICKUP,
          BookingValetStatus.PICKED_UP,
          BookingValetStatus.PARKED,
          BookingValetStatus.ON_THE_WAY_TO_DROP,
        ]),
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

    /**
     * FINAL STEP
     * When valet completes job → booking becomes completed
     */
    if (valetStatus === BookingValetStatus.COMPLETED) {
      booking.status = "completed";

      // release valet
      if (booking.valetId) {
        await this.releaseValet(booking.valetId);
      }

      // free slot
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
    await redisClient.del(`userBookings:v2:${booking.userId}`);

    await this.sendValetStatusEmail(updated);

    return updated;
  }

  async verifyPickupPin(bookingId: string, valetId: string, pin: string) {
    const bookingRepo = AppDataSource.getRepository(Booking);

    const booking = await bookingRepo.findOne({ where: { id: bookingId } });

    if (!booking) throw new Error("Booking not found");

    if (booking.valetId !== valetId)
      throw new Error("Not your assigned booking");

    if (booking.pickupPinUsed) throw new Error("Pickup PIN already verified");

    if (!booking.pickupPin || booking.pickupPin !== pin)
      throw new Error("Invalid pickup PIN");

    if (
      booking.valetStatus !== BookingValetStatus.ASSIGNED &&
      booking.valetStatus !== BookingValetStatus.ON_THE_WAY_TO_PICKUP
    ) {
      throw new Error("Cannot verify pickup in current status");
    }

    booking.pickupPinUsed = true;
    booking.valetStatus = BookingValetStatus.PICKED_UP;

    const updated = await bookingRepo.save(booking);

    await redisClient.del(`booking:${bookingId}`);
    await redisClient.del(`userBookings:v2:${booking.userId}`);

    // notify customer via email that valet picked up their car
    await this.sendValetStatusEmail(updated);

    return {
      valetStatus: updated.valetStatus,
      entryPin: updated.entryPin,
    };
  }
}

export const bookingService = new BookingService();
