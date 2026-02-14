// services/valet.service.ts

import { AppDataSource } from "../../../db/data-source";
import {
  Valet,
  ValetAvailabilityStatus,
  ValetEmployementStatus,
} from "../entities/valets.entity";
import { Garage } from "../../garage/entities/garage.entity";

// Approve valet
export const approveValetService = async (
  valetId: string,
  managerUserId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  // 1. Find valet
  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) {
    throw new Error("Valet not found");
  }

  // 2. Check if already processed
  if (valet.employmentStatus !== ValetEmployementStatus.PENDING) {
    throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
  }

  // 3. Verify manager is assigned to this garage
  const garage = await garageRepo.findOne({
    where: { id: valet.garageId },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  // 4. Approve valet
  valet.employmentStatus = ValetEmployementStatus.ACTIVE;
  valet.approvedBy = managerUserId;

  return await valetRepo.save(valet);
};

// Reject valet
export const rejectValetService = async (
  valetId: string,
  managerUserId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  // 1. Find valet
  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) {
    throw new Error("Valet not found");
  }

  // 2. Check if already processed
  if (valet.employmentStatus !== ValetEmployementStatus.PENDING) {
    throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
  }

  // 3. Verify manager is assigned to this garage
  const garage = await garageRepo.findOne({
    where: { id: valet.garageId },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  // 4. Reject valet
  valet.employmentStatus = ValetEmployementStatus.REJECTED;
  valet.approvedBy = managerUserId;

  return await valetRepo.save(valet);
};

// Get valets by garage (for manager)
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

  // 1. Verify manager owns this garage
  const garage = await garageRepo.findOne({
    where: { id: garageId },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  if (garage.managerId !== managerUserId) {
    throw new Error("You are not the manager of this garage");
  }

  // 2. Build query
  const where: any = { garageId };
  if (filters.status) {
    where.employmentStatus = filters.status;
  }

  const skip = (filters.page - 1) * filters.limit;

  // 3. Get valets with count
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

export const getAvailableValetService = async (garageId: string) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  return await valetRepo.findOne({
    where: {
      garageId,
      employmentStatus: ValetEmployementStatus.ACTIVE,
      availabilityStatus: ValetAvailabilityStatus.AVAILABLE,
    },
    order: { createdAt: "ASC" }, // oldest gets job first
  });
};

export const assignValetToBookingService = async (
  valetId: string,
  bookingId: string,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) {
    throw new Error("Valet not found");
  }

  if (valet.availabilityStatus !== ValetAvailabilityStatus.AVAILABLE) {
    throw new Error("Valet is not available");
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

  if (!valet) {
    throw new Error("Valet not found");
  }

  valet.availabilityStatus = ValetAvailabilityStatus.AVAILABLE;
  valet.currentBookingId = null;

  return await valetRepo.save(valet);
};
