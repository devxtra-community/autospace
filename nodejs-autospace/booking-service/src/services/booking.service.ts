import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../models/booking.model.js";

const bookingRepo = AppDataSource.getRepository(Booking);

export class BookingService {
  async checkSlotAvailability(slotId: string, authToken: string) {
    try {
      const response = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/slots/available?slotId=${slotId}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      return response.data.data;
    } catch {
      throw new Error("Failed to check slot availability");
    }
  }

  async lockSlot(slotId: string, authToken: string) {
    try {
      const response = await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/internal/slots/${slotId}/lock`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      return response.data;
    } catch {
      throw new Error("Failed to lock slot");
    }
  }

  async createBooking(bookingData: {
    userId: string;
    garageId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }) {
    try {
      const booking = bookingRepo.create(bookingData);
      const savedBooking = await bookingRepo.save(booking);
      return savedBooking;
    } catch {
      throw new Error("Failed to create booking");
    }
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
