import { Request, Response } from "express";
import {
  createGarageSlot,
  getGarageSlots,
  getGarageSlotsByFloor,
  getPublicAvailableSlotsService,
} from "../services/garage-slot.service";
import { AppDataSource } from "../../../db/data-source";
import { Garage } from "../entities/garage.entity";
import { GarageSlot } from "../entities/garage-slot.entity";

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

export const getPublicAvailableSlotsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const garageId = req.params.garageId as string;
    const { startTime, endTime } = req.query as {
      startTime?: string;
      endTime?: string;
    };

    if (!garageId) {
      return res.status(400).json({
        success: false,
        message: "garageId is required",
      });
    }

    const slots = await getPublicAvailableSlotsService({
      garageId,
      startTime,
      endTime,
    });

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch available slots",
    });
  }
};

export async function getGarageByManager(req: Request, res: Response) {
  const { managerId } = req.params;

  const garage = await AppDataSource.getRepository(Garage)
    .createQueryBuilder("g")
    .where("g.managerId = :managerId", { managerId })
    .select(["g.id"])
    .getOne();

  console.log("reosurce garageid", garage?.id);

  if (!garage) {
    return res.status(404).json({
      success: false,
      message: "Garage not found for this manager",
    });
  }

  return res.json({
    success: true,
    data: { garageId: garage.id },
  });
}

const slotRepo = AppDataSource.getRepository(GarageSlot);

export const getSlotByIdInternal = async (req: Request, res: Response) => {
  try {
    const slotId = String(req.params.slotId);

    const slot = await slotRepo.findOne({
      where: { id: slotId },
      select: ["id", "slotNumber", "slotSize", "status"],
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    return res.json({
      success: true,
      data: slot,
    });
  } catch (err) {
    console.error("Internal slot fetch error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch slot",
    });
  }
};
