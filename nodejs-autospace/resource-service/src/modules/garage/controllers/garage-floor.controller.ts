import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { GarageFloor } from "../entities/garage-floor.entity";
import { Garage } from "../entities/garage.entity";
import {
  getMyGarageFloors,
  getSlotsByFloor,
} from "../services/garage-floor.service";

export const createGarageFloorController = async (
  req: Request,
  res: Response,
) => {
  const managerId = req.user.id;
  const role = req.user.role;

  if (!managerId || role !== "manager") {
    return res.status(403).json({
      success: false,
      message: "Only managers can create floors",
    });
  }

  const { garageCode, floorNumber } = req.body;

  if (!garageCode || floorNumber == null) {
    return res.status(400).json({
      success: false,
      message: "garageCode and floorNumber are required",
    });
  }

  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);

  const garage = await garageRepo.findOne({
    where: { garageRegistrationNumber: garageCode },
  });

  if (!garage) {
    return res.status(404).json({
      success: false,
      message: "Garage not found",
    });
  }

  if (garage.managerId !== managerId) {
    return res.status(403).json({
      success: false,
      message: "You are not assigned to this garage",
    });
  }

  const floor = floorRepo.create({
    garageId: garage.id,
    floorNumber,
  });

  await floorRepo.save(floor);

  return res.status(201).json({
    success: true,
    message: "Floor created successfully",
    data: floor,
  });
};

export const getMyFloorsController = async (req: Request, res: Response) => {
  try {
    const managerId = req.user.id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const floors = await getMyGarageFloors(managerId);

    return res.status(200).json({
      success: true,
      message: "Garage floors fetched successfully",
      data: floors,
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
      message: "Failed to fetch garage floors",
    });
  }
};

export const getSlotByFloorController = async (res: Response, req: Request) => {
  try {
    const managerId = req.user.id;
    const floorIdParam = req.params.floorId;

    const floorId = Array.isArray(floorIdParam)
      ? floorIdParam[0]
      : floorIdParam;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!floorId) {
      return res.status(400).json({
        success: false,
        message: "floorId is required",
      });
    }

    const slots = await getSlotsByFloor(managerId, floorId);

    return res.status(200).json({
      success: true,
      message: "Garage slot by floor fetched successfully",
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
      message: "Failed to fetch garage floors by slot",
    });
  }
};
