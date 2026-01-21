import { Request, Response } from "express";
import { createSlot } from "../services/slot.service";

export const createSlotController = async (req: Request, res: Response) => {
  try {
    const managerId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    console.log("HEADERS:", req.headers);

    if (!managerId || role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can create slots",
      });
    }

    const { date, startTime, endTime, price } = req.body;

    if (!date || !startTime || !endTime || !price) {
      return res.status(400).json({
        success: false,
        message: "date, startTime, endTime and price are required",
      });
    }

    const slot = await createSlot(managerId, date, startTime, endTime, price);

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
