import { AppDataSource } from "../../../db/data-source";
import { GarageSlot } from "../entities/garage-slot.entity";
import { GarageFloor } from "../entities/garage-floor.entity";
import { Garage } from "../entities/garage.entity";
import { In } from "typeorm";

export const createGarageSlot = async (
  managerId: string,
  floorNumber: number,
  slotNumber: string,
  pricePerHour: number,
): Promise<GarageSlot> => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);
  const slotRepo = AppDataSource.getRepository(GarageSlot);

  const garage = await garageRepo.findOne({ where: { managerId } });
  if (!garage) {
    throw new Error("No garage assigned to this manager");
  }

  const floor = await floorRepo.findOne({
    where: { garageId: garage.id, floorNumber },
  });
  if (!floor) {
    throw new Error(`Floor ${floorNumber} not found in your garage`);
  }

  const existingSlot = await slotRepo.findOne({
    where: { floorId: floor.id, slotNumber },
  });
  if (existingSlot) {
    throw new Error(`Slot ${slotNumber} already exists on this floor`);
  }

  const slot = slotRepo.create({
    floorId: floor.id,
    slotNumber,
    pricePerHour,
    status: "AVAILABLE",
  });

  await slotRepo.save(slot);
  return slot;
};

export const getGarageSlots = async (
  managerId: string,
): Promise<GarageSlot[]> => {
  try {
    const garageRepo = AppDataSource.getRepository(Garage);
    const floorRepo = AppDataSource.getRepository(GarageFloor);
    const slotRepo = AppDataSource.getRepository(GarageSlot);

    const garage = await garageRepo.findOne({
      where: { managerId },
    });

    if (!garage) {
      throw new Error("garage not found");
    }

    const floor = await floorRepo.find({
      where: { garageId: garage.id },
      select: ["id", "floorNumber"],
      order: { floorNumber: "ASC" },
    });

    if (!floor.length) {
      throw new Error("No floors found in this garage");
    }

    const floorId = floor.map((f) => f.id);

    const slots = await slotRepo.find({
      where: {
        floorId: In(floorId),
      },
      order: {
        slotNumber: "ASC",
      },
    });

    return slots;
  } catch (error) {
    console.log("slot setup error", error);
    throw error;
  }
};
