import { Request, Response } from "express";
import { createGarage, updateGarageProfile } from "../services/garage.service";
import {
  assignManagerToGarage,
  getGaragesByCompanyId,
} from "../services/garage2.service";

export const createGarageController = async (req: Request, res: Response) => {
  console.log("RESOURCE BODY:", req.body);
  try {
    const ownerUserId = req.headers["x-user-id"] as string;

    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const garage = await createGarage(ownerUserId, req.body);

    return res.status(201).json({
      success: true,
      message: "Garage created successfully. Awaiting approval.",
      data: garage,
    });
  } catch (error: any) {
    if (
      error.message === "Company not found or not approved" ||
      error.message === "Garage already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Garage creation failed",
    });
  }
};

export const assignManagerController = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.headers["x-user-id"] as string;
    const { garageCode, managerId } = req.body;

    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!garageCode || !managerId) {
      return res.status(400).json({
        success: false,
        message: "garageCode and managerId are required",
      });
    }

    const result = await assignManagerToGarage(
      ownerUserId,
      garageCode,
      managerId,
    );

    return res.status(200).json({
      success: true,
      message: "Manager assigned to garage successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGaragesByCompanyController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const companyId = req.params.companyId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getGaragesByCompanyId(companyId, page, limit);

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

export const updateGarageProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const garageId = req.params.id as string;
    const { name, contactEmail, contactPhone, valetAvailable, capacity } =
      req.body;

    if (
      !name &&
      !contactEmail &&
      !contactPhone &&
      valetAvailable === undefined &&
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const garage = await updateGarageProfile(garageId, {
      name,
      contactEmail,
      contactPhone,
      valetAvailable,
      capacity,
    });

    return res.status(200).json({
      success: true,
      message: "Garage profile updated successfully",
      data: garage,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update garage",
    });
  }
};
