import { Request, Response } from "express";
import { createGarageSlot } from "../services/garage-slot.service";

export const createGarageSlotController = async (
  req: Request,
  res: Response,
) => {
  try {
    const managerId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;

    if (!managerId || role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can create slots",
      });
    }

    const { floorNumber, slotNumber, pricePerHour } = req.body;

    if (floorNumber == null || !slotNumber || pricePerHour == null) {
      return res.status(400).json({
        success: false,
        message: "floorNumber, slotNumber and pricePerHour are required",
      });
    }

    const slot = await createGarageSlot(
      managerId,
      floorNumber,
      slotNumber,
      pricePerHour,
    );

    return res.status(201).json({
      success: true,
      message: "Slot created successfully",
      data: slot,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
