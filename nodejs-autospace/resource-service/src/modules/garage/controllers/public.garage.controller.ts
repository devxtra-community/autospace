import { Request, Response } from "express";
import {
  getGarageByIdService,
  getPublicGarages,
} from "../services/public-garage.service";

export const getPublicGarageController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // console.log(" CONTROLLER HIT");
    // console.log("RAW QUERY:", req.query);
    // console.log("VALIDATED QUERY:", req.validateQuery);

    const query = req.validateQuery;
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid query" });
    }

    const latitude = query.lat ? Number(query.lat) : undefined;
    const longitude = query.lng ? Number(query.lng) : undefined;

    console.log("lat and long", latitude, longitude);

    if (
      (latitude !== undefined && isNaN(latitude)) ||
      (longitude !== undefined && isNaN(longitude))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    const radius = query.radius ? Number(query.radius) : 25;
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;

    const result = await getPublicGarages({
      latitude,
      longitude,
      radius,
      valetAvailable: query.valetAvailable,
      limit,
      page,
    });

    return res.status(200).json({
      success: true,
      message: "Garages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching public garages:", error.message);
    } else {
      console.error("Unknown error fetching public garages:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch garages",
    });
  }
};

export const getPublicGarageById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const garageId = Array.isArray(req.params.garageId)
      ? req.params.garageId[0]
      : req.params.garageId;

    if (!garageId) {
      return res.status(404).json({
        success: false,
        message: "garageId is wrong or not get",
      });
    }

    const garage = await getGarageByIdService(garageId);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "garge data successfully fetched",
      data: garage,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching public garages:", error.message);
    } else {
      console.error("Unknown error fetching public garages:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch garages",
    });
  }
};
