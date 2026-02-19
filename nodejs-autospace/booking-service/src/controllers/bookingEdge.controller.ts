import type { Request, Response } from "express";
import {
  cancelBookingService,
  enrichBookingsWithSlot,
  enterBookingService,
  exitBookingService,
  getActiveBookingService,
  getBookingHistoryService,
} from "../services/bookingEdge.service.js";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import axios from "axios";

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
  } catch (error: unknown) {
    let message = "Entry failed";

    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
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
  } catch (error: unknown) {
    let message = "Exit failed";

    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
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
  } catch (error: unknown) {
    let message = "cancell failed";

    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
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
  } catch (error: unknown) {
    let message = "booking failed";

    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
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
  } catch (error: unknown) {
    let message = "history failed";

    if (error instanceof Error) {
      message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

async function getManagerGarageId(managerId: string) {
  const res = await axios.get(
    `${process.env.RESOURCE_SERVICE_URL}/garages/internal/${managerId}/garageId`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
        "x-user-id": "booking-service",
        "x-user-role": "SERVICE",
      },
    },
  );

  return res.data.data.garageId;
}

export async function listManagerBookings(req: Request, res: Response) {
  const { page = 1, limit = 10, search, status, sort = "DESC" } = req.query;

  const userId = req.user?.id;

  // console.log("managerID" , userId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const garageId = await getManagerGarageId(userId);

  // console.log("garageId",garageId);

  const qb = AppDataSource.getRepository(Booking)
    .createQueryBuilder("b")
    .where("b.garageId = :garageId", { garageId });

  if (status) {
    qb.andWhere("b.status = :status", { status });
  }

  if (search) {
    qb.andWhere(
      "(b.entryPin ILIKE :search OR b.exitPin ILIKE :search OR b.id::text ILIKE :search)",
      { search: `%${search}%` },
    );
  }

  qb.orderBy("b.startTime", sort === "ASC" ? "ASC" : "DESC");

  qb.skip((Number(page) - 1) * Number(limit));
  qb.take(Number(limit));

  const [data, total] = await qb.getManyAndCount();

  const enrichedData = await enrichBookingsWithSlot(data);

  return res.json({
    success: true,
    data: enrichedData,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
}
