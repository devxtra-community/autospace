import { Request, Response } from "express";
import {
  createGarageSlot,
  getGarageSlots,
  getGarageSlotsByFloor,
} from "../services/garage-slot.service";

export const createGarageSlotController = async (
  req: Request,
  res: Response,
) => {
  try {
    const managerId = req.user.id;
    const role = req.user.role;

    if (role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can create slots",
      });
    }

    const { floorNumber, slotNumber, slotSize } = req.body;

    if (floorNumber == null || !slotNumber || !slotSize) {
      return res.status(400).json({
        success: false,
        message: "floorNumber, slotNumber and slotSize are required",
      });
    }

    const slot = await createGarageSlot(
      managerId,
      floorNumber,
      slotNumber,
      slotSize,
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSlotsByFloorController = async (
  req: Request,
  res: Response,
) => {
  try {
    const managerId = req.user.id;
    const floorId = req.params.floorId as string;

    const slots = await getGarageSlotsByFloor(managerId, floorId);

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
