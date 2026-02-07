import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { GarageSlot } from "../entities/garage-slot.entity";

const slotRepo = AppDataSource.getRepository(GarageSlot);

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const garageId = req.params.garageId;
    const floorNumber = req.params.floorId;

    let query = `
       SELECT s.* 
       FROM  garage_slots s 
       JOIN garage_floors f ON s.floor_id = f.id
       WHERE s.status = 'AVAILABLE'
     `;

    const params = [];

    if (garageId) {
      query += ` AND f.garage_id = $${params.length + 1}`;
      params.push(garageId);
    }

    if (floorNumber) {
      query += ` AND f.floor_number = $${params.length + 1}`;
      params.push(floorNumber);
    }

    const slots = await slotRepo.query(query, params);

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
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

export const lockSlot = async (req: Request, res: Response) => {
  try {
    const slotId = String(req.params.slotId);

    const result = await slotRepo.query(
      `UPDATE garage_slots
       SET status = 'RESERVED'
       WHERE id = $1 AND status = 'AVAILABLE'
       RETURNING *`,
      [slotId],
    );

    if (!result.length) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching lock slots:", error.message);
    } else {
      console.error("Unknown error fetching lock slots:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lock slots",
    });
  }
};

export const releaseSlot = async (req: Request, res: Response) => {
  try {
    const slotId = String(req.params.slotId);

    const result = await slotRepo.query(
      `UPDATE garage_slots
       SET status = 'AVAILABLE'
       WHERE id = $1 AND status = 'RESERVED'
       RETURNING *`,
      [slotId],
    );

    res.json({ success: true, data: result[0] || null });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching release slots:", error.message);
    } else {
      console.error("Unknown error fetching release slots:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch release slots",
    });
  }
};

export const occupySlot = async (req: Request, res: Response) => {
  try {
    const slotId = String(req.params.slotId);

    const result = await slotRepo.query(
      `UPDATE garage_slots
       SET status = 'OCCUPIED'
       WHERE id = $1 AND status = 'RESERVED'
       RETURNING *`,
      [slotId],
    );

    res.json({ success: true, data: result[0] });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching occupy slot:", error.message);
    } else {
      console.error("Unknown error fetching occupy slot:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch occupy slot",
    });
  }
};

export const freeSlot = async (req: Request, res: Response) => {
  try {
    const slotId = String(req.params.slotId);

    const result = await slotRepo.query(
      `UPDATE garage_slots
       SET status = 'AVAILABLE'
       WHERE id = $1 AND status = 'OCCUPIED'
       RETURNING *`,
      [slotId],
    );

    res.json({ success: true, data: result[0] || null });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching free slots:", error.message);
    } else {
      console.error("Unknown error fetching free slots:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to free slots",
    });
  }
};

export const listSlotsByGarage = async (req: Request, res: Response) => {
  try {
    const garageId = String(req.params.garageId);

    const slots = await slotRepo.query(
      `
      SELECT s.*, f.floor_number
      FROM garage_slots s
      JOIN garage_floors f ON s.floor_id = f.id
      WHERE f.garage_id = $1
      ORDER BY f.floor_number, s.slot_number
      `,
      [garageId],
    );

    res.json({ success: true, data: slots });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching list slots per garage:", error.message);
    } else {
      console.error("Unknown error slots per garage:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to list slots per garages",
    });
  }
};
