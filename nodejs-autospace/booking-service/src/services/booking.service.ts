import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { In, LessThan, MoreThan } from "typeorm";

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
    try {
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
    } catch {
      throw new Error("Failed to lock slot");
    }
  }

  async releaseSlot(slotId: string) {
    try {
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
    } catch {
      throw new Error("Failed to release slot");
    }
  }

  async assignValetIfAvailable(garageId: string, bookingId: string) {
    try {
      const response = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/valets/available/${garageId}`,
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

      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/valets/${valet.id}/assign`,
        { bookingId },
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      return valet.id;
    } catch {
      return null; // fallback to manual
    }
  }

  async releaseValet(valetId: string) {
    try {
      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/valets/${valetId}/release`,
        {},
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );
    } catch {
      console.log("Valet release failed");
    }
  }

  async createBooking(bookingData: {
    userId: string;
    garageId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    valetRequested: boolean;
  }) {
    let slotLocked = false;

    return await AppDataSource.transaction(async (manager) => {
      const bookingRepoTx = manager.getRepository(Booking);

      // Check overlap
      const overlap = await bookingRepoTx.findOne({
        where: {
          slotId: bookingData.slotId,
          status: In(["pending", "confirmed"]),
          startTime: LessThan(bookingData.endTime),
          endTime: MoreThan(bookingData.startTime),
        },
      });

      if (overlap) {
        throw new Error("Slot already booked for this time range");
      }

      // Lock slot
      const locked = await this.lockSlot(bookingData.slotId);
      if (!locked) {
        throw new Error("Slot already reserved by another user");
      }

      slotLocked = true;

      try {
        // Create booking
        const booking = bookingRepoTx.create({
          ...bookingData,
          status: "pending",
          valetRequested: bookingData.valetRequested || false,
          valetStatus: bookingData.valetRequested
            ? BookingValetStatus.REQUESTED
            : BookingValetStatus.NONE,
        });

        const savedBooking = await bookingRepoTx.save(booking);

        // HYBRID VALET LOGIC
        if (savedBooking.valetRequested) {
          const valetId = await this.assignValetIfAvailable(
            savedBooking.garageId,
            savedBooking.id,
          );

          if (valetId) {
            savedBooking.valetId = valetId;
            savedBooking.valetStatus = BookingValetStatus.ASSIGNED;
            await bookingRepoTx.save(savedBooking);
          }
        }

        return savedBooking;
      } catch (error) {
        if (slotLocked) {
          await this.releaseSlot(bookingData.slotId);
        }
        throw error;
      }
    });
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");

    booking.status = status;

    // If booking completed → release valet
    if (status === "completed" && booking.valetId) {
      await this.releaseValet(booking.valetId);
      booking.valetStatus = BookingValetStatus.COMPLETED;
    }

    return await bookingRepo.save(booking);
  }

  async getBookingById(bookingId: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");
    return booking;
  }

  async getUserBookings(userId: string) {
    return await bookingRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async deleteBooking(bookingId: string) {
    return await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Booking);
      const booking = await repo.findOne({ where: { id: bookingId } });

      if (!booking) throw new Error("Booking not found");

      await this.releaseSlot(booking.slotId);

      if (booking.valetId) {
        await this.releaseValet(booking.valetId);
      }

      await repo.delete(bookingId);
      return true;
    });
  }

  async verifyOwnership(bookingId: string, userId: string) {
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== userId)
      throw new Error("Forbidden - Not your booking");

    return booking;
  }
}

export const bookingService = new BookingService();
