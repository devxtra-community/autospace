import { Request, Response } from "express";
import { resolveGarageService } from "../services/resolve-garage.service";
import { registerValetService } from "../services/valet-register.service";
import {
  assignValetToBookingService,
  getAvailableValetService,
  releaseValetService,
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

    const valet = await getAvailableValetService(garageId);

    return res.status(200).json({
      success: true,
      data: valet || null,
    });
  } catch {
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

    const valet = await assignValetToBookingService(valetId, bookingId);

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
