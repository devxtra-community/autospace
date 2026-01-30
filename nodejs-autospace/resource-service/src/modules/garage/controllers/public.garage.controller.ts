import { Request, Response } from "express";
import { getPublicGarages } from "../services/public-garage.service";

export const getPublicGarageController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const query = req.validateQuery;
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid query" });
    }

    const { lat, lng, radius, valetAvailable, limit, page } = query;

    const result = await getPublicGarages({
      latitude: lat,
      longitude: lng,
      radius,
      valetAvailable,
      page,
      limit,
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
