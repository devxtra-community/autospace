import { AppDataSource } from "../../../db/data-source";
import { Garage } from "../entities/garage.entity";
import { GarageFloor } from "../entities/garage-floor.entity";
import { GarageSlot } from "../entities/garage-slot.entity";

export const getMyGarageFloors = async (
  managerId: string,
): Promise<GarageFloor[]> => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);

  const garage = await garageRepo.findOne({
    where: { managerId },
  });

  if (!garage) {
    throw new Error("Garage not found for this manager");
  }

  const floors = await floorRepo.find({
    where: { garageId: garage.id },
    order: { floorNumber: "ASC" },
    select: ["id", "floorNumber", "createdAt"],
  });

  if (!floors.length) {
    throw new Error("No floors found in this garage");
  }

  return floors;
};

export const getSlotsByFloor = async (
  managerId: string,
  floorId: string,
): Promise<GarageSlot[]> => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);
  const slotRepo = AppDataSource.getRepository(GarageSlot);

  const garage = await garageRepo.findOne({
    where: { managerId },
  });

  if (!garage) {
    throw new Error("Garage not found for this manager");
  }

  const floor = await floorRepo.findOne({
    where: { id: floorId, garageId: garage.id },
  });

  if (!floor) {
    throw new Error("Floor not found in your garage");
  }

  const slots = await slotRepo.find({
    where: { floorId: floor.id },
    order: { slotNumber: "ASC" },
  });

  return slots;
};
