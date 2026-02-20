import { Request, Response } from "express";
import axios from "axios";

import { resolveGarageService } from "../services/resolve-garage.service";
import { registerValetService } from "../services/valet-register.service";

import {
  getAvailableValetService,
  releaseValetService,
  markValetBusyService,
} from "../services/valet.service";

export const resolveGarage = async (req: Request, res: Response) => {
  try {
    const result = await resolveGarageService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to resolve garage",
    });
  }
};

export const registerValet = async (req: Request, res: Response) => {
  try {
    const result = await registerValetService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to register valet",
    });
  }
};

export const getAvailableValetController = async (
  req: Request,
  res: Response,
) => {
  try {
    const garageId = req.params.garageId as string;

    const exclude = req.query.exclude as string | undefined;

    const excludeIds = exclude ? exclude.split(",") : [];

    const valet = await getAvailableValetService(garageId, excludeIds);

    return res.status(200).json({
      success: true,
      data: valet || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available valet",
    });
  }
};

export const assignValetController = async (req: Request, res: Response) => {
  try {
    const valetId = req.params.valetId as string;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId required",
      });
    }

    // STEP 1: Ask booking-service to assign valet FIRST
    await axios.patch(
      `${process.env.BOOKING_SERVICE_URL}/bookings/internal/${bookingId}/assign`,
      { valetId },
      {
        headers: {
          "x-user-id": valetId,
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );

    // STEP 2: ONLY if booking-service succeeds → mark valet busy
    const valet = await markValetBusyService(valetId, bookingId);

    return res.status(200).json({
      success: true,
      data: valet,
    });
  } catch (error: any) {
    console.error("Assign valet error:", error.response?.data || error.message);

    return res.status(400).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

export const releaseValetController = async (req: Request, res: Response) => {
  try {
    const valetId = req.params.valetId as string;

    const valet = await releaseValetService(valetId);

    return res.status(200).json({
      success: true,
      data: valet,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
