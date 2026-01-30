import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { Company, CompanyStatus } from "../../company/entities/company.entity";
import axios from "axios";

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

  if (manager.status !== "active") {
    throw new Error("Manager is not active");
  }

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

  return {
    garageCode: garage.garageRegistrationNumber,
    managerId,
    message: "Manager assigned to garage successfully",
  };
};

export const getGarageById = async (id: string) => {
  const repo = AppDataSource.getRepository(Garage);

  const garage = await repo.findOne({
    where: { id },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  return garage;
};

export const getAllGarages = async (page = 1, limit = 10) => {
  const repo = AppDataSource.getRepository(Garage);

  const [data, total] = await repo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    // valetAvailable : valetAvailable,
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

export const getGaragesByCompanyId = async (
  companyId: string,
  page = 1,
  limit = 10,
) => {
  const repo = AppDataSource.getRepository(Garage);

  const [data, total] = await repo.findAndCount({
    where: { companyId },
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
