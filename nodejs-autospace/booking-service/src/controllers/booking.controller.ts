import type { Request, Response } from "express";
import { BookingService } from "../services/booking.service.js";
import { logger } from "../utils/logger.js";
import {
  ValidationError,
  validateBookingInput,
  validateStatusTransition,
} from "../validators/booking.vallidator.js";
import type { Booking } from "../entities/booking.entity.js";

const bookingService = new BookingService();

export class BookingController {
  async createBookingController(req: Request, res: Response) {
    // let locked = false;
    const { slotId, garageId, startTime, endTime, vehicleType } = req.body;

    // console.log("vahicle from frontend",vehicleType);
    const userId = req.user?.id;
    // const authToken = req.headers.authorization?.split(" ")[1];

    // console.log("userdetails",authToken);

    try {
      if (!slotId || !garageId || !startTime || !endTime || !vehicleType) {
        return res.status(400).json({
          success: false,
          message: "slotId, garageId, startTime, endTime are required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated , Please Login",
        });
      }

      // if (!authToken) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Access token missing",
      //   });
      // }

      validateBookingInput({
        slotId,
        userId,
        garageId,
        startTime,
        endTime,
        vehicleType,
        status: "pending",
      });

      // console.log("slotId =", slotId),
      //     console.log("authToken =", authToken)
      const available = await bookingService.checkSlotAvailability({
        slotId,
      });

      if (!available) {
        return res.status(409).json({
          success: false,
          message: "Slot not available",
        });
      }

      const overlap = await bookingService.checkOverlap(
        slotId,
        new Date(startTime),
        new Date(endTime),
      );

      if (overlap) {
        return res.status(409).json({
          success: false,
          message: "Slot already booked for this time range",
        });
      }

      // await bookingService.lockSlot(slotId);

      // locked = true;

      const booking = await bookingService.createBooking({
        userId,
        garageId,
        slotId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        vehicleType,
        status: "pending",
      });

      logger.info("booking created", booking.id);

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      // if (locked && slotId ) {
      //   try {
      //     await bookingService.releaseSlot(slotId);
      //   } catch (rollbackError) {
      //     logger.error("Slot rollback failed", rollbackError);
      //   }
      // }

      if (error instanceof ValidationError) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }

      logger.error("Create booking failed", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // each booking single

  async getBooking(req: Request, res: Response) {
    try {
      const bookingIdRaw = req.params.bookingId;
      const bookingId = Array.isArray(bookingIdRaw)
        ? bookingIdRaw[0]
        : bookingIdRaw;

      console.log("bookid", bookingId);

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID required",
        });
      }

      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      logger.error("BookingController.getBooking failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
      });
    }
  }

  // get all bookings

  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      console.log("user", userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const bookings = await bookingService.getUserBookings(userId);

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      logger.error("BookingController.getMyBookings failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
      });
    }
  }

  // update Booknig status

  async updateStatus(req: Request, res: Response) {
    let slotAction: "NONE" | "RELEASED" | "OCCUPIED" = "NONE";
    let booking: Booking | null = null;

    try {
      const bookingIdRaw = req.params.bookingId; // this line because from params string[]  as come sto we want to convert
      const bookingId = Array.isArray(bookingIdRaw)
        ? bookingIdRaw[0]
        : bookingIdRaw;

      const { status } = req.body;

      if (!bookingId || !status) {
        return res.status(400).json({
          success: false,
          message: "bookingId and status are required",
        });
      }

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const bookings = await bookingService.verifyOwnership(bookingId, userId);

      console.log(bookings);

      booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (!validateStatusTransition(booking.status, status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition: ${booking.status} → ${status}`,
        });
      }

      // const authToken = req.headers.authorization?.split(" ")[1];

      // if (!authToken) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Auth token required for slot sync",
      //   });
      // }

      // if (status === "confirmed") { };

      if (status === "completed") {
        await bookingService.occupySlot(booking.slotId);
        slotAction = "OCCUPIED";

        await bookingService.releaseSlot(booking.slotId);
        slotAction = "RELEASED";
      }

      if (status === "cancelled") {
        await bookingService.releaseSlot(booking.slotId);
        slotAction = "RELEASED";
      }

      const updated = await bookingService.updateBookingStatus(
        bookingId,
        status,
      );

      return res.status(200).json({
        success: true,
        message: "Booking status updated",
        data: updated,
      });
    } catch (error) {
      try {
        if (booking) {
          if (slotAction === "RELEASED") {
            await bookingService.lockSlot(booking.slotId);
          }

          if (slotAction === "OCCUPIED") {
            await bookingService.releaseSlot(booking.slotId);
          }
        }
      } catch (rollbackError) {
        logger.error("Rollback failed", rollbackError);
      }

      logger.error("BookingController.updateStatus failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update booking",
      });
    }
  }

  // booking delete

  async deleteBooking(req: Request, res: Response) {
    try {
      const bookingIdRaw = req.params.bookingId;
      const bookingId = Array.isArray(bookingIdRaw)
        ? bookingIdRaw[0]
        : bookingIdRaw;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID required",
        });
      }

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const bookings = await bookingService.verifyOwnership(bookingId, userId);

      if (bookings) {
        return {
          success: false,
          message: "no verified",
        };
      }

      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      await bookingService.releaseSlot(booking.slotId);

      const deleted = await bookingService.deleteBooking(bookingId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Booking deleted",
      });
    } catch (error) {
      logger.error("BookingController.deleteBooking failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete booking",
      });
    }
  }

  async confirmBooking(req: Request, res: Response) {
    try {
      const bookingIdRaw = req.params.bookingId;
      const bookingId = Array.isArray(bookingIdRaw)
        ? bookingIdRaw[0]
        : bookingIdRaw;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID required",
        });
      }

      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      if (booking.status !== "pending") {
        return res
          .status(400)
          .json({ success: false, message: "Booking already processed" });
      }

      const updated = await bookingService.updateBookingStatus(
        bookingId,
        "confirmed",
      );

      return res.json({
        success: true,
        message: "Booking confirmed",
        data: updated,
      });
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "Confirm failed" });
    }
  }
}

export const bookingController = new BookingController();
