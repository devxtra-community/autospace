import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { CreateGarageInput } from "@autospace/shared";
import { Company, CompanyStatus } from "../../company/entities/company.entity";
import redisClient from "../../../config/redis";
import {
  Valet,
  ValetEmployementStatus,
} from "../../valets/entities/valets.entity";

export const createGarage = async (
  ownerUserId: string,
  data: CreateGarageInput,
) => {
  const companyRepo = AppDataSource.getRepository(Company);
  const garageRepo = AppDataSource.getRepository(Garage);

  const company = await companyRepo.findOne({
    where: {
      ownerUserId: ownerUserId,
      status: CompanyStatus.ACTIVE,
    },
  });
  if (!company) {
    throw new Error("Company not found or not approved");
  }
  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("Latitude and longitude are required");
  }

  const exists = await garageRepo.findOne({
    where: { companyId: company.id, name: data.name },
  });
  if (exists) {
    throw new Error("Garage already exists for this Company");
  }

  const result = await AppDataSource.query(
    `SELECT nextval('garage_grn_seq') as seq`,
  );

  const seqNumber = result[0].seq;
  const garageRegistrationNumber = `GR-${String(seqNumber).padStart(4, "0")}`;

  console.log("CREATE GARAGE INPUT:", data);

  const garage = garageRepo.create({
    name: data.name,
    locationName: data.locationName,
    latitude: data.latitude,
    longitude: data.longitude,
    capacity: data.capacity,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    openingTime: data.openingTime,
    closingTime: data.closingTime,
    companyId: company.id,
    garageRegistrationNumber,
    createdBy: ownerUserId,
    status: GarageStatus.PENDING,
    ...(data.valetServiceRadius !== undefined && {
      valetServiceRadius: data.valetServiceRadius,
    }),
  });

  const saved = await garageRepo.save(garage);

  return {
    id: saved.id,
    name: saved.name,
    locationName: saved.locationName,
    openingTime: saved.openingTime,
    closingTime: saved.closingTime,
    latitude: saved.latitude,
    longitude: saved.longitude,
    contactEmail: saved.contactEmail,
    contactPhone: saved.contactPhone,
    status: saved.status,
    garageRegistrationNumber,
    valetServiceRadius: saved.valetServiceRadius,
    createdAt: saved.createdAt,
  };
};

export const getGarageByStatus = async (
  status: GarageStatus,
  page = 1,
  limit = 10,
) => {
  const repo = AppDataSource.getRepository(Garage);

  const [data, total] = await repo.findAndCount({
    where: { status },
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: "DESC" },
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateGarageStatus = async (
  companyId: string,
  status: GarageStatus,
  adminUserId: string,
) => {
  const repo = AppDataSource.getRepository(Garage);

  const garage = await repo.findOne({
    where: { id: companyId },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  // Valid transitions:
  // PENDING  → ACTIVE, REJECTED
  // ACTIVE   → BLOCKED, REJECTED
  // BLOCKED  → ACTIVE
  // REJECTED → ACTIVE
  const validTransitions: Record<GarageStatus, GarageStatus[]> = {
    [GarageStatus.PENDING]: [GarageStatus.ACTIVE, GarageStatus.REJECTED],
    [GarageStatus.ACTIVE]: [GarageStatus.BLOCKED, GarageStatus.REJECTED],
    [GarageStatus.BLOCKED]: [GarageStatus.ACTIVE],
    [GarageStatus.REJECTED]: [GarageStatus.ACTIVE],
  };

  const allowed = validTransitions[garage.status] ?? [];

  if (!allowed.includes(status)) {
    throw new Error(
      `Cannot transition garage from '${garage.status}' to '${status}'`,
    );
  }

  garage.status = status;

  await repo.save(garage);

  await redisClient.del(`garage:${companyId}`);

  console.log(
    `[AUDIT] Admin ${adminUserId} set garage ${companyId} from ${garage.status} to ${status}`,
  );

  return garage;
};

export const updateGarageProfile = async (
  garageId: string,
  data: {
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    valetAvailable?: boolean;
    capacity?: number;
    valetServiceRadius?: number;
  },
) => {
  const repo = AppDataSource.getRepository(Garage);

  const garage = await repo.findOne({ where: { id: garageId } });

  if (!garage) {
    throw new Error("Garage not found");
  }

  if (data.name !== undefined) garage.name = data.name;
  if (data.contactEmail !== undefined) garage.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) garage.contactPhone = data.contactPhone;
  if (data.valetAvailable !== undefined)
    garage.valetAvailable = data.valetAvailable;
  if (data.capacity !== undefined) garage.capacity = data.capacity;
  if (data.valetServiceRadius !== undefined)
    garage.valetServiceRadius = data.valetServiceRadius;

  await repo.save(garage);

  return garage;
};

export const getMyManagerGarageService = async (managerId: string) => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const valetRepo = AppDataSource.getRepository(Valet);

  const garage = await garageRepo.findOne({
    where: { managerId },
  });

  if (!garage) {
    throw new Error("Garage not found for this manager");
  }

  const activeValetCount = await valetRepo.count({
    where: {
      garageId: garage.id,
      employmentStatus: ValetEmployementStatus.ACTIVE,
    },
  });

  return {
    ...garage,
    activeValetCount,
  };
};
