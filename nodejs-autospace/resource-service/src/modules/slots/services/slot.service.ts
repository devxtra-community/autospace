import { AppDataSource } from "../../../db/data-source";
import { Slot } from "../entities/slot.entity";
import { Garage } from "../../garage/entities/garage.entity";

export const createSlot = async (
  managerId: string,
  date: string,
  startTime: string,
  endTime: string,
  price: number,
) => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const slotRepo = AppDataSource.getRepository(Slot);

  const garage = await garageRepo.findOne({
    where: { managerId },
  });

  if (!garage) {
    throw new Error("Manager is not assigned to any garage");
  }

  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const overlapCount = await slotRepo
    .createQueryBuilder("slot")
    .where("slot.garageId = :garageId", { garageId: garage.id }) // same garage
    .andWhere("slot.date = :date", { date }) // same day
    .andWhere(
      `(:startTime < slot."endTime" AND :endTime > slot."startTime")`,
      { startTime, endTime }, // time clash logic
    )
    .getCount(); // we only care if at least 1 exists

  if (overlapCount > 0) {
    throw new Error("Time slot overlaps with an existing slot");
  }

  const slot = slotRepo.create({
    garageId: garage.id,
    date,
    startTime,
    endTime,
    price,
    isBooked: false,
  });

  const savedSlot = await slotRepo.save(slot);

  return savedSlot;
};
