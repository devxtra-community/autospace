import { AppDataSource } from "../../../db/data-source";
import {
  Valet,
  ValetAvailabilityStatus,
  ValetEmployementStatus,
} from "../entities/valets.entity";
import { Garage } from "../../garage/entities/garage.entity";

export const approveValetService = async (
  valetId: string,
  managerUserId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) throw new Error("Valet not found");

  if (valet.employmentStatus !== ValetEmployementStatus.PENDING) {
    throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
  }

  const garage = await garageRepo.findOne({
    where: { id: valet.garageId },
  });

  if (!garage) throw new Error("Garage not found");

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  valet.employmentStatus = ValetEmployementStatus.ACTIVE;
  valet.approvedBy = managerUserId;

  return await valetRepo.save(valet);
};

export const rejectValetService = async (
  valetId: string,
  managerUserId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) throw new Error("Valet not found");

  if (valet.employmentStatus !== ValetEmployementStatus.PENDING) {
    throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
  }

  const garage = await garageRepo.findOne({
    where: { id: valet.garageId },
  });

  if (!garage) throw new Error("Garage not found");

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  valet.employmentStatus = ValetEmployementStatus.REJECTED;
  valet.approvedBy = managerUserId;

  return await valetRepo.save(valet);
};

export const getValetsByGarageService = async (
  garageId: string,
  managerUserId: string,
  filters: {
    status?: ValetEmployementStatus;
    page: number;
    limit: number;
  },
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  const garage = await garageRepo.findOne({
    where: { id: garageId },
  });

  if (!garage) throw new Error("Garage not found");

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  const where: any = { garageId };

  if (filters.status) {
    where.employmentStatus = filters.status;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [data, total] = await valetRepo.findAndCount({
    where,
    skip,
    take: filters.limit,
    order: { createdAt: "DESC" },
  });

  return {
    data,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};

export const getAvailableValetService = async (
  garageId: string,
  excludeIds?: string[],
) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const query = valetRepo
    .createQueryBuilder("valet")
    .where("valet.garageId = :garageId", { garageId })
    .andWhere("valet.employmentStatus = :employmentStatus", {
      employmentStatus: ValetEmployementStatus.ACTIVE,
    })
    .andWhere("valet.availabilityStatus = :availabilityStatus", {
      availabilityStatus: ValetAvailabilityStatus.AVAILABLE,
    });

  // EXCLUDE rejected valets
  if (excludeIds && excludeIds.length > 0) {
    query.andWhere("valet.id NOT IN (:...excludeIds)", {
      excludeIds,
    });
  }

  return await query.orderBy("valet.createdAt", "ASC").getOne();
};

export const markValetBusyService = async (
  valetId: string,
  bookingId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) throw new Error("Valet not found");

  if (valet.availabilityStatus !== ValetAvailabilityStatus.AVAILABLE) {
    throw new Error("Valet not available");
  }

  valet.availabilityStatus = ValetAvailabilityStatus.BUSY;
  valet.currentBookingId = bookingId;

  return await valetRepo.save(valet);
};

export const releaseValetService = async (valetId: string) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) throw new Error("Valet not found");

  valet.availabilityStatus = ValetAvailabilityStatus.AVAILABLE;
  valet.currentBookingId = null;

  return await valetRepo.save(valet);
};
