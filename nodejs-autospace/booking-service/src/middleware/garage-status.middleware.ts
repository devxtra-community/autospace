import type { Request, Response, NextFunction } from "express";
import axios from "axios";

export const requireActiveGarage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== "manager" && user.role !== "valet")) {
      return next();
    }

    const response = await axios.get(
      `${process.env.RESOURCE_SERVICE_URL}/internal/garages/users/${user.id}/status`,
      {
        headers: {
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
        },
      },
    );

    if (response.data?.data?.status === "blocked") {
      res.status(403).json({
        success: false,
        message: "Garage blocked by authority",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Garage status check failed in booking service:", error);
    next();
  }
};
