import { Request, Response } from "express";
import {
  approveValetService,
  rejectValetService,
  releaseValetService,
} from "../services/valet.service";
import { getValetByIdService } from "../services/valetDetail.service";

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
      success: false,
      message: "Valet rejected successfully",
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

export const getMyAvailabilityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.headers["x-user-id"] as string;

    if (!valetId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const valetRepo = req.app.get("db").getRepository("valet");

    const valet = await valetRepo.findOne({
      where: { id: valetId },
    });

    if (!valet) {
      return res.status(404).json({
        success: false,
        message: "Valet not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        availabilityStatus: valet.availabilityStatus,
        currentBookingId: valet.currentBookingId,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
    });
  }
};

export const releaseValetController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.params.valetId as string;

    const valet = await releaseValetService(valetId);

    return res.status(200).json({
      success: true,
      message: "Valet released successfully",
      data: valet,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyValetController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.user?.id;

    if (!valetId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const valet = await getValetByIdService(valetId);

    return res.status(200).json({
      success: true,
      message: "My valet profile fetched successfully",
      data: valet,
    });
  } catch (error: any) {
    if (error.message === "Valet not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch valet profile",
    });
  }
};
