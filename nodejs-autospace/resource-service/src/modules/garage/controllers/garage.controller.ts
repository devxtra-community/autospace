import { Request, Response } from "express";
import {
  createGarage,
  getMyManagerGarageService,
  updateGarageProfile,
} from "../services/garage.service";
import {
  assignManagerToGarage,
  getGaragesByCompanyId,
} from "../services/garage2.service";

export const createGarageController = async (req: Request, res: Response) => {
  console.log("RESOURCE BODY:", req.body);
  try {
    const ownerUserId = req.user.id;
    console.log("user ith", ownerUserId);

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
    const ownerUserId = req.user.id;
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
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;
    const page = req.query.page ? Number(req.query.page) : 1;

    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const search = req.query.search ? String(req.query.search) : undefined;

    const status = req.query.status ? String(req.query.status) : undefined;

    const result = await getGaragesByCompanyId(companyId, {
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Garages fetched successfully",

      data: result.data,

      meta: result.meta,
    });
  } catch {
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

export const getMyManagerGarageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const managerId = req.user?.id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const garage = await getMyManagerGarageService(managerId);

    return res.status(200).json({
      success: true,
      data: garage,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch garage",
    });
  }
};
