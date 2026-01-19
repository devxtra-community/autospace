import { Request, Response } from "express";
import { createGarage } from "../services/garage.service";
import { assignManagerToGarage } from "../services/garage.service";

export const createGarageController = async (req: Request, res: Response) => {
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
