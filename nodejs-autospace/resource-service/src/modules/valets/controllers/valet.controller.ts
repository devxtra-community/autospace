import { Request, Response } from "express";
import {
  approveValetService,
  assignValetToBookingService,
  getAvailableValetService,
  rejectValetService,
  releaseValetService,
} from "../services/valet.service";

// export const approveValetController

export const approveValetController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.params.id as string;
    const managerUserId = req.headers["x-user-id"] as string;

    if (!managerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const valet = await approveValetService(valetId, managerUserId);

    return res.status(200).json({
      success: true,
      message: "Valet approved successfully",
      data: valet,
    });
  } catch (error: any) {
    if (
      error.message === "Valet not found" ||
      error.message === "Garage not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("already") ||
      error.message.includes("not the manager")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to approve valet",
    });
  }
};

// Reject valet
export const rejectValetController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.params.id as string;
    const managerUserId = req.headers["x-user-id"] as string;

    if (!managerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const valet = await rejectValetService(valetId, managerUserId);

    return res.status(200).json({
      success: true,
      message: "Valet rejected",
      data: valet,
    });
  } catch (error: any) {
    if (
      error.message === "Valet not found" ||
      error.message === "Garage not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("already") ||
      error.message.includes("not the manager")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reject valet",
    });
  }
};
