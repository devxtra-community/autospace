import { AppDataSource } from "../../../db/data-source";
import { GarageSlot, SlotSize } from "../entities/garage-slot.entity";
import { GarageFloor } from "../entities/garage-floor.entity";
import { Garage } from "../entities/garage.entity";
import { In, Like } from "typeorm";

export interface PublicSlotQuery {
  garageId: string;
  startTime?: string;
  endTime?: string;
}

export const createGarageSlot = async (
  managerId: string,
  floorNumber: number,
  slotNumber: string,
  slotSize: SlotSize,
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

  const match = slotNumber.match(/^([A-Z])([1-5])$/);
  if (!match) {
    throw new Error("Invalid slot number. Use A1–A5, B1–B5, etc.");
  }

  const letter = match[1];

  const sameLetterCount = await slotRepo.count({
    where: {
      floorId: floor.id,
      slotNumber: Like(`${letter}%`),
    },
  });

  if (sameLetterCount >= 5) {
    throw new Error(`Slot group ${letter} already has 5 slots`);
  }

  const floors = await floorRepo.find({
    where: { garageId: garage.id },
    select: ["id"],
  });

  const totalSlotsInGarage = await slotRepo.count({
    where: {
      floorId: In(floors.map((f) => f.id)),
    },
  });

  if (totalSlotsInGarage >= garage.capacity) {
    throw new Error("Garage capacity exceeded");
  }

  const existingSlot = await slotRepo.findOne({
    where: { floorId: floor.id, slotNumber },
  });
  if (existingSlot) {
    throw new Error(`Slot ${slotNumber} already exists on this floor`);
  }

  const pricePerHour =
    slotSize === SlotSize.STANDARD
      ? garage.standardSlotPrice
      : garage.largeSlotPrice;

  const slot = slotRepo.create({
    floorId: floor.id,
    slotNumber,
    slotSize,
    pricePerHour,
    status: "AVAILABLE",
  });

  await slotRepo.save(slot);
  return slot;
};
export const getGarageSlots = async (
  managerId: string,
): Promise<GarageSlot[]> => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);
  const slotRepo = AppDataSource.getRepository(GarageSlot);

  const garage = await garageRepo.findOne({ where: { managerId } });
  if (!garage) {
    throw new Error("garage not found");
  }

  const floors = await floorRepo.find({
    where: { garageId: garage.id },
    select: ["id"],
  });

  return slotRepo.find({
    where: { floorId: In(floors.map((f) => f.id)) },
    order: { slotNumber: "ASC" },
  });
};

export const getGarageSlotsByFloor = async (
  managerId: string,
  floorId: string,
) => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const slotRepo = AppDataSource.getRepository(GarageSlot);

  const garage = await garageRepo.findOne({ where: { managerId } });
  if (!garage) throw new Error("garage not found");

  return slotRepo.find({
    where: { floorId },
    order: { slotNumber: "ASC" },
  });
};

export const getPublicAvailableSlotsService = async ({
  garageId,
}: PublicSlotQuery) => {
  const slotRepo = AppDataSource.getRepository(GarageSlot);

  const slots = await slotRepo.find({
    where: {
      floor: {
        garage: {
          id: garageId,
        },
      },
    },
    relations: ["floor", "floor.garage"],
    order: {
      floor: {
        floorNumber: "ASC",
      },
      slotNumber: "ASC",
    },
  });

  return slots.map((slot) => ({
    id: slot.id,
    slotNumber: slot.slotNumber,
    floor: slot.floor.floorNumber,
    name: slot.slotNumber,
    status:
      slot.status === "AVAILABLE"
        ? "available"
        : slot.status === "RESERVED"
          ? "booked"
          : "disabled",
  }));
};
