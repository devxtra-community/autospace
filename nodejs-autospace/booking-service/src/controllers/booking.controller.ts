import type { Request, Response } from "express";
import { BookingService } from "../services/booking.service.js";
import { logger } from "../utils/logger.js";
import {
  ValidationError,
  validateBookingInput,
} from "../validators/booking.validator.js";
import { BookingValetStatus } from "../entities/booking.entity.js";
const bookingService = new BookingService();

export class BookingController {
  async createBookingController(req: Request, res: Response) {
    const { slotId, garageId, startTime, endTime, valetRequested } = req.body;
    const userId = req.user?.id;

    try {
      if (!slotId || !garageId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "slotId, garageId, startTime, endTime are required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      validateBookingInput({
        slotId,
        userId,
        garageId,
        startTime,
        endTime,
        status: "pending",
      });

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

      const booking = await bookingService.createBooking({
        userId,
        garageId,
        slotId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        valetRequested: valetRequested || false,
      });

      logger.info("Booking created", booking.id);

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
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

  async getBooking(req: Request, res: Response) {
    try {
      const bookingId = Array.isArray(req.params.bookingId)
        ? req.params.bookingId[0]
        : req.params.bookingId;

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
      logger.error("Get booking failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
      });
    }
  }

  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

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
      logger.error("Get my bookings failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const bookingId = Array.isArray(req.params.bookingId)
        ? req.params.bookingId[0]
        : req.params.bookingId;

      const { status } = req.body;

      const valetId = req.user?.id;

      if (!bookingId || !status) {
        return res.status(400).json({
          success: false,
          message: "bookingId and status required",
        });
      }

      if (!valetId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.valetId !== valetId) {
        console.log("booking.valetId:", booking.valetId);
        console.log("req.user.id:", valetId);

        return res.status(403).json({
          success: false,
          message: "Not your assigned job",
        });
      }

      const updated = await bookingService.updateBookingStatus(
        bookingId,
        status,
      );

      return res.status(200).json({
        success: true,
        message: "Job completed",
        data: updated,
      });
    } catch (error) {
      logger.error("Complete job failed", error);

      return res.status(500).json({
        success: false,
        message: "Failed to complete job",
      });
    }
  }

  async deleteBooking(req: Request, res: Response) {
    try {
      const bookingId = Array.isArray(req.params.bookingId)
        ? req.params.bookingId[0]
        : req.params.bookingId;

      const userId = req.user?.id;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID required",
        });
      }

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      await bookingService.verifyOwnership(bookingId, userId);

      const deleted = await bookingService.deleteBooking(bookingId);

      return res.status(200).json({
        success: true,
        message: "Booking deleted",
        data: deleted,
      });
    } catch (error) {
      logger.error("Delete booking failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete booking",
      });
    }
  }

  async confirmBooking(req: Request, res: Response) {
    try {
      const bookingId = Array.isArray(req.params.bookingId)
        ? req.params.bookingId[0]
        : req.params.bookingId;

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

      if (booking.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Booking already processed",
        });
      }

      const updated = await bookingService.updateBookingStatus(
        bookingId,
        "confirmed",
      );

      return res.status(200).json({
        success: true,
        message: "Booking confirmed",
        data: updated,
      });
    } catch (error) {
      logger.error("Confirm booking failed", error);
      return res.status(500).json({
        success: false,
        message: "Confirm failed",
      });
    }
  }
  async assignValetInternal(req: Request, res: Response) {
    try {
      const bookingId = req.params.bookingId as string;
      const valetId = req.user?.id;

      if (!bookingId || !valetId) {
        return res.status(400).json({
          success: false,
          message: "bookingId and valetId required",
        });
      }

      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (!booking.valetRequested) {
        return res.status(400).json({
          success: false,
          message: "Valet was not requested for this booking",
        });
      }

      if (booking.valetStatus !== BookingValetStatus.REQUESTED) {
        return res.status(400).json({
          success: false,
          message: "Valet already assigned or processed",
        });
      }

      // ensure only correct valet can accept
      if (booking.currentValetRequestId !== valetId) {
        return res.status(400).json({
          success: false,
          message: "This valet is not assigned this request",
        });
      }

      booking.valetId = valetId;
      booking.valetStatus = BookingValetStatus.ASSIGNED;
      booking.status = "confirmed";

      // Clear queue tracking
      booking.currentValetRequestId = null;
      booking.rejectedValetIds = null;

      const updated = await bookingService.updateBookingWithValet(booking);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      logger.error("Assign valet failed", error);
      return res.status(500).json({
        success: false,
        message: "Failed to assign valet",
      });
    }
  }

  async rejectValet(req: Request, res: Response) {
    try {
      const bookingId = req.params.bookingId as string;
      const { valetId } = req.body;

      if (!bookingId || !valetId) {
        return res.status(400).json({
          success: false,
          message: "bookingId and valetId required",
        });
      }

      const updated = await bookingService.rejectValetRequest(
        bookingId,
        valetId,
      );

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      logger.error("Reject valet failed", error);
      return res.status(400).json({
        success: false,
        message: "Failed to reject valet: ",
      });
    }
  }

  async getValetRequests(req: Request, res: Response) {
    try {
      const valetId = req.user?.id;

      if (!valetId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const requests = await bookingService.getValetRequests(valetId);

      return res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch valet requests",
        error,
      });
    }
  }

  async getActiveJobs(req: Request, res: Response) {
    try {
      const valetId = req.user?.id;

      if (!valetId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const activeJobs = await bookingService.getActiveJobs(valetId);

      return res.status(200).json({
        success: true,
        data: activeJobs,
      });
    } catch (error) {
      logger.error("Get active jobs failed", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch active jobs",
      });
    }
  }

  async getCompletedJobs(req: Request, res: Response) {
    try {
      const valetId = req.user?.id;

      if (!valetId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const completedJobs = await bookingService.getCompletedJobs(valetId);

      return res.status(200).json({
        success: true,
        data: completedJobs,
      });
    } catch (error) {
      logger.error("Get completed jobs failed", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch completed jobs",
      });
    }
  }
}

export const bookingController = new BookingController();
