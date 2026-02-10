import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../models/booking.model.js";
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

  async checkSlotAvailability({
    slotId,
    authToken,
  }: {
    slotId: string;
    authToken: string;
  }) {
    console.log("CHECK SLOT FUNCTION HIT", slotId);
    console.log("CHECK authtoken FUNCTION HIT", authToken);
    try {
      const response = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/status`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      console.log("RESPONSE =>", response.data);

      return response.data.data?.status === "AVAILABLE";
    } catch {
      // console.log("AXIOS ERROR FULL =>", error);
      // console.log("AXIOS ERROR MSG =>", error.message);
      // console.log("AXIOS ERROR STATUS =>", error?.response?.status);
      // console.log("AXIOS ERROR DATA =>", error?.response?.data);
      throw new Error("Failed to check slot availability");
    }
  }

  async lockSlot(slotId: string, authToken: string) {
    try {
      const response = await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/lock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      return response.data?.success === true;
    } catch {
      // console.error(
      //   "REAL SLOT ERROR =>",
      //   error?.response?.status,
      //   error?.response?.data,
      //   error.message
      // );
      throw new Error("Failed to check slot availability");
    }
  }

  async releaseSlot(slotId: string, authToken: string) {
    try {
      const response = await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/free`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      return response.data;
    } catch {
      throw new Error("Failed to release slot");
    }
  }

  async occupySlot(slotId: string, authToken: string) {
    await axios.post(
      `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${slotId}/occupy`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } },
    );
  }

  async createBooking(
    bookingData: {
      userId: string;
      garageId: string;
      slotId: string;
      startTime: Date;
      endTime: Date;
      status: string;
    },
    authToken: string,
  ) {
    let slotLocked = false;
    return await AppDataSource.transaction(async (manager) => {
      const bookingRepoTx = manager.getRepository(Booking);

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

      const locked = await this.lockSlot(bookingData.slotId, authToken);

      if (!locked) {
        throw new Error("Slot already reserved by another user");
      }

      slotLocked = true;

      try {
        const booking = bookingRepoTx.create({
          ...bookingData,
          status: "pending",
        });

        const savedBooking = await bookingRepoTx.save(booking);
        return savedBooking;
      } catch (err) {
        if (slotLocked) {
          await this.releaseSlot(bookingData.slotId, authToken);
        }
        throw err;
      }
    });
  }

  async getBookingById(bookingId: string) {
    try {
      const booking = await bookingRepo.findOne({
        where: { id: bookingId },
      });
      return booking;
    } catch {
      throw new Error("Failed to fetch booking");
    }
  }

  async getUserBookings(userId: string) {
    try {
      const bookings = await bookingRepo.find({
        where: { userId },
      });
      return bookings;
    } catch {
      throw new Error("Failed to fetch user bookings");
    }
  }

  async updateBookingStatus(bookingId: string, status: string) {
    try {
      const booking = await bookingRepo.findOne({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      booking.status = status;
      const updatedBooking = await bookingRepo.save(booking);
      return updatedBooking;
    } catch {
      throw new Error("Failed to update booking");
    }
  }

  async deleteBooking(bookingId: string) {
    try {
      const result = await bookingRepo.delete(bookingId);
      return (result.affected ?? 0) > 0;
    } catch {
      throw new Error("Failed to delete booking");
    }
  }
}

export const bookingService = new BookingService();
