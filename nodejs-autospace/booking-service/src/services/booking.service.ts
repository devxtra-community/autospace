import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { EntityManager, In, IsNull, LessThan, MoreThan } from "typeorm";

const bookingRepo = AppDataSource.getRepository(Booking);

export class BookingService {
  async checkOverlap(slotId: string, start: Date, end: Date): Promise<boolean> {
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
      `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/free`,
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
    vehicleType: "sedan" | "suv";
    status?: string;
    valetRequested: boolean;
  }) {
    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const repo = manager.getRepository(Booking);

      const overlap = await repo.findOne({
        where: {
          slotId: bookingData.slotId,
          status: In(["pending", "confirmed"]),
          startTime: LessThan(bookingData.endTime),
          endTime: MoreThan(bookingData.startTime),
        },
      });

      if (overlap) {
        throw new Error("Slot already booked");
      }

      const locked = await this.lockSlot(bookingData.slotId);

      if (!locked) {
        throw new Error("Slot lock failed");
      }

      try {
        function generatePin(): string {
          return Math.floor(1000 + Math.random() * 9000).toString();
        }

        const booking = repo.create({
          userId: bookingData.userId,
          garageId: bookingData.garageId,
          slotId: bookingData.slotId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          vehicleType: bookingData.vehicleType,
          status: bookingData.status || "pending",
          valetRequested: bookingData.valetRequested,
          valetStatus: bookingData.valetRequested
            ? BookingValetStatus.REQUESTED
            : BookingValetStatus.NONE,

          entryPin: generatePin(),
          entryUsed: false,
          exitUsed: false,
        });

        const savedBooking = await repo.save(booking);

        if (savedBooking.valetRequested) {
          await this.assignFirstValetRequest(savedBooking, manager);
        }

        return savedBooking;
      } catch (err) {
        await this.releaseSlot(bookingData.slotId);
        throw err;
      }
    });
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
    return await bookingRepo.save(booking);
  }

  async getBookingById(id: string) {
    const booking = await bookingRepo.findOne({
      where: { id },
    });

    if (!booking) throw new Error("Booking not found");

    return booking;
  }

  async getManualAssignments(managerId: string) {
    // STEP 1: get manager garage
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

    // STEP 2: get bookings needing manual assign

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

    const result = [];

    for (const booking of bookings) {
      const availableValetsRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const availableValets = availableValetsRes.data?.data
        ? [availableValetsRes.data.data]
        : [];

      const userRes = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const slotRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/slots/${booking.slotId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      result.push({
        bookingId: booking.id,

        customer: {
          id: booking.userId,
          name: userRes.data.data.fullname,
          phone: userRes.data.data.phone,
        },

        garage: {
          id: garage.id,
          name: garage.name,
          location: garage.locationName,
        },

        slot: {
          id: slotRes.data.data.id,
          slotNumber: slotRes.data.data.slotNumber,
          slotType: slotRes.data.data.slotSize,
        },

        timing: {
          startTime: booking.startTime,
          endTime: booking.endTime,
        },

        rejectedValetIds: booking.rejectedValetIds || [],

        availableValets,

        createdAt: booking.createdAt,
      });
    }

    return result;
  }

  async getUserBookings(userId: string) {
    return await bookingRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    booking.status = status;

    if (status === "confirmed") {
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

    return await bookingRepo.save(booking);
  }

  async deleteBooking(bookingId: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    await this.releaseSlot(booking.slotId);

    if (booking.valetId) await this.releaseValet(booking.valetId);

    await bookingRepo.delete(bookingId);

    return true;
  }

  async verifyOwnership(bookingId: string, userId: string) {
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
    const bookings = await bookingRepo.find({
      where: {
        valetId,
        valetStatus: BookingValetStatus.ASSIGNED,
      },
    });

    return await this.enrichBookings(bookings);
  }

  async getCompletedJobs(valetId: string) {
    const bookings = await bookingRepo.find({
      where: {
        valetId,
        valetStatus: BookingValetStatus.COMPLETED,
      },
    });

    return await this.enrichBookings(bookings);
  }
}

export const bookingService = new BookingService();
