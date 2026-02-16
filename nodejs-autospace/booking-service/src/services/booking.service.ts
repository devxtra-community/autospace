import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { EntityManager, In, LessThan, MoreThan } from "typeorm";

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
    await axios.post(
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
        const booking = repo.create({
          ...bookingData,
          status: "pending",
          valetRequested: bookingData.valetRequested,
          valetStatus: bookingData.valetRequested
            ? BookingValetStatus.REQUESTED
            : BookingValetStatus.NONE,
        });

        const savedBooking = await repo.save(booking);

        // FIX: pass manager
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

      console.log("Assigned valet request to:", valet.id);

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

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.currentValetRequestId !== valetId) {
      throw new Error("Not assigned valet");
    }

    const rejected = booking.rejectedValetIds || [];

    rejected.push(valetId);

    booking.rejectedValetIds = rejected;

    const response = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${booking.garageId}`,
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
        params: {
          exclude: rejected.join(","),
        },
      },
    );

    const nextValet = response.data?.data;

    if (!nextValet) {
      booking.currentValetRequestId = null;
      booking.valetStatus = BookingValetStatus.NONE;

      return await bookingRepo.save(booking);
    }

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

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
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

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.status = status;

    if (status === "completed" && booking.valetId) {
      await this.releaseValet(booking.valetId);

      booking.valetStatus = BookingValetStatus.COMPLETED;
    }

    return await bookingRepo.save(booking);
  }

  async deleteBooking(bookingId: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    await this.releaseSlot(booking.slotId);

    if (booking.valetId) {
      await this.releaseValet(booking.valetId);
    }

    await bookingRepo.delete(bookingId);

    return true;
  }

  async verifyOwnership(bookingId: string, userId: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Forbidden");
    }

    return booking;
  }
}

export const bookingService = new BookingService();
