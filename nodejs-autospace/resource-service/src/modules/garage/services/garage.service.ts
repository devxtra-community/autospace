import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { CreateGarageInput } from "@autospace/shared";
import { Company, CompanyStatus } from "../../company/entities/company.entity";
import axios from "axios";

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

  const garage = garageRepo.create({
    ...data,
    companyId: company.id,
    garageRegistrationNumber,
    createdBy: ownerUserId,
    status: GarageStatus.PENDING,
  });

  const saved = await garageRepo.save(garage);

  return {
    id: saved.id,
    name: saved.name,
    locationName: saved.locationName,
    status: saved.status,
    garageRegistrationNumber,
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

  if (garage.status !== GarageStatus.PENDING) {
    throw new Error("Garage already processed");
  }

  garage.status = status;
  await repo.save(garage);

  console.log(
    `[AUDIT] Admin ${adminUserId} set company ${companyId} to ${status}`,
  );

  return garage;
};

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001/api/manager";

export const assignManagerToGarage = async (
  ownerUserId: string,
  garageCode: string,
  managerId: string,
) => {
  const companyRepo = AppDataSource.getRepository(Company);
  const garageRepo = AppDataSource.getRepository(Garage);

  const company = await companyRepo.findOne({
    where: {
      ownerUserId,
      status: CompanyStatus.ACTIVE,
    },
  });

  if (!company) {
    throw new Error("Active company not found for owner");
  }

  const garage = await garageRepo.findOne({
    where: {
      garageRegistrationNumber: garageCode,
      companyId: company.id,
      status: GarageStatus.ACTIVE,
    },
  });

  if (!garage) {
    throw new Error("Garage not found or not active");
  }

  if (garage.managerId) {
    throw new Error("Garage already has a manager");
  }

  const { data: manager } = await axios.get(
    `${AUTH_SERVICE_URL}/internal/${managerId}`,
  );

  if (manager.role !== "manager") {
    throw new Error("User is not a manager");
  }

  if (manager.companyId !== company.id) {
    throw new Error("Manager does not belong to this company");
  }

  if (manager.managerState !== "unassigned") {
    throw new Error("Manager already assigned");
  }

  garage.managerId = managerId;
  await garageRepo.save(garage);

  await axios.post(`${AUTH_SERVICE_URL}/internal/${managerId}/assign`);

  console.log("AUTH GET:", `${AUTH_SERVICE_URL}/internal/${managerId}`);
  console.log("AUTH POST:", `${AUTH_SERVICE_URL}/internal/${managerId}/assign`);

  return {
    garageCode: garage.garageRegistrationNumber,
    managerId,
    message: "Manager assigned to garage successfully",
  };
};
