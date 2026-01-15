import { AppDataSource } from "nodejs-autospace/resource-service/src/db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { CreateGarageInput } from "@autospace/shared";
import { Company, CompanyStatus } from "../../company/entities/company.entity";

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
    throw new Error("Garage already exists");
  }

  const garage = garageRepo.create({
    ...data,
    companyId: company.id,
    createdBy: ownerUserId,
    status: GarageStatus.PENDING,
  });

  const saved = await garageRepo.save(garage);

  return {
    id: saved.id,
    name: saved.name,
    locationName: saved.locationName,
    capacity: saved.capacity,
    status: saved.status,
    createdAt: saved.createdAt,
  };
};
