import { Request, Response } from "express";
import {
  createGarageSlot,
  getGarageSlots,
} from "../services/garage-slot.service";
import { success } from "zod";

export const createGarageSlotController = async (
  req: Request,
  res: Response,
) => {
  try {
    const managerId = req.user.id;
    const role = req.user.role;

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

export const getSlotController = async (req: Request, res: Response) => {
  try {
    const managerId = req.user.id;
    console.log("manager", managerId);

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const slots = await getGarageSlots(managerId);

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
