import { Request, Response } from "express";
import { GarageStatus } from "../entities/garage.entity";
import {
  getGarageByStatus,
  updateGarageStatus,
} from "../services/garage.service";
import { getGarageById, getAllGarages } from "../services/garage2.service";

export const getPendingGarages = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getGarageByStatus(GarageStatus.PENDING, page, limit);

    return res.status(200).json({
      success: true,
      message: "Pending garages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Get pending garages failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending garages",
    });
  }
};

export const approveGarage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const adminUserId = req.user.id;

    const garage = await updateGarageStatus(
      id,
      GarageStatus.ACTIVE,
      adminUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Garage approved successfully",
      data: garage,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to approve garage",
    });
  }
};

export const rejectGarage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const adminUserId = req.user.id;

    const garage = await updateGarageStatus(
      id,
      GarageStatus.REJECTED,
      adminUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Garage rejected successfully",
      data: garage,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reject garage",
    });
  }
};

export const getGarageByIdController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const garageId = req.params.id as string;

    const garage = await getGarageById(garageId);

    return res.status(200).json({
      success: true,
      message: "Garage fetched successfully",
      data: garage,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Garage not found",
    });
  }
};

export const getAllGaragesController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getAllGarages(page, limit);

    return res.status(200).json({
      success: true,
      message: "Garages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch garages",
    });
  }
};
