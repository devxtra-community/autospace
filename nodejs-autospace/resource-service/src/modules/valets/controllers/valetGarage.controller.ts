import { Request, Response } from "express";
import { getValetsByGarageService } from "../services/valet.service";

import {
  getCompanyValetsService,
  getValetByIdService,
  getPendingValetsService,
} from "../services/valetDetail.service";
import { GetValetsByGarageQuery } from "../validators/valets.validator";
import { ValetEmployementStatus } from "../entities/valets.entity";

// export const approveValetController

// Get valets by garage
export const getValetsByGarageController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const garageIdParam = req.params.garageId;

  const garageId = Array.isArray(garageIdParam)
    ? garageIdParam[0]
    : garageIdParam;

  const managerUserId = req.user?.id;

  if (!managerUserId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!garageId) {
    return res.status(400).json({
      success: false,
      message: "GarageId required",
    });
  }

  const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;

  const limit =
    typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

  const employmentStatus =
    typeof req.query.employmentStatus === "string"
      ? req.query.employmentStatus
      : undefined;

  const availabilityStatus =
    typeof req.query.availabilityStatus === "string"
      ? req.query.availabilityStatus
      : undefined;

  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  const result = await getValetsByGarageService(garageId, managerUserId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,

    employmentStatus: req.query.employmentStatus as any,

    availabilityStatus: req.query.availabilityStatus as any,

    search: req.query.search as string | undefined,
  });

  return res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
};

// Get company valets (for owner)
export const getCompanyValetsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const companyId = req.params.companyId as string;
    const ownerUserId = req.headers["x-user-id"] as string;
    const { status, page, limit } =
      req.query as unknown as GetValetsByGarageQuery;

    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getCompanyValetsService(companyId, {
      status: status as ValetEmployementStatus | undefined,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Company valets fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company valets",
    });
  }
};

// Get valet by ID
export const getValetByIdController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const valetId = req.params.id as string;

    const valet = await getValetByIdService(valetId);

    return res.status(200).json({
      success: true,
      message: "Valet fetched successfully",
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
      message: "Failed to fetch valet",
    });
  }
};

// Get pending valets for manager
export const getPendingValetsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const garageId = req.query.garageId as string;
    const managerUserId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!garageId) {
      return res.status(400).json({
        success: false,
        message: "garageId is required",
      });
    }

    if (!managerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getPendingValetsService(
      garageId,
      managerUserId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Pending valets fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    if (
      error.message === "Garage not found" ||
      error.message.includes("not the manager")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending valets",
    });
  }
};
