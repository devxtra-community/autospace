import type { Request, Response } from "express";
import {
  cancelBookingService,
  enterBookingService,
  exitBookingService,
  getActiveBookingService,
  getBookingHistoryService,
} from "../services/bookingEdge.service.js";

export async function enterBookingController(req: Request, res: Response) {
  try {
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw)
      ? bookingIdRaw[0]
      : bookingIdRaw;

    const { pin } = req.body;

    if (!bookingId || !pin) {
      return res.status(400).json({
        success: false,
        message: "bookingId and pin required",
      });
    }

    const result = await enterBookingService(bookingId, pin);

    return res.status(200).json({
      success: true,
      message: "Entry successful, car parked",
      data: result,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "entry pin failed",
    });
  }
}

export async function exitBooking(req: Request, res: Response) {
  try {
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw)
      ? bookingIdRaw[0]
      : bookingIdRaw;

    const { pin } = req.body;

    if (!bookingId || !pin) {
      return res.status(400).json({
        success: false,
        message: "bookingId and pin required",
      });
    }

    const result = await exitBookingService(bookingId, pin);

    return res.status(200).json({
      success: true,
      message: "Exit successful, booking completed",
      data: result,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "exit booking failed",
    });
  }
}

export async function cancelBooking(req: Request, res: Response) {
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

    const result = await cancelBookingService(bookingId);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: result,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Cancel failed",
    });
  }
}

export async function getActiveBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const booking = await getActiveBookingService(userId);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch active booking",
    });
  }
}

export async function getBookingHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const history = await getBookingHistoryService(userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch booking history",
    });
  }
}
