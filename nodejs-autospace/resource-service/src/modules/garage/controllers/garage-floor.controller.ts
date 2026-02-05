import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { GarageFloor } from "../entities/garage-floor.entity";
import { Garage } from "../entities/garage.entity";

export const createGarageFloorController = async (
  req: Request,
  res: Response,
) => {
  const managerId = req.headers["x-user-id"] as string;
  const role = req.headers["x-user-role"] as string;

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
