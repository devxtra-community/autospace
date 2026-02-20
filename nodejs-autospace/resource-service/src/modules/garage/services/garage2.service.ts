import { AppDataSource } from "../../../db/data-source";
import { Garage, GarageStatus } from "../entities/garage.entity";
import { Company, CompanyStatus } from "../../company/entities/company.entity";
import axios from "axios";
import { GarageSlot } from "../entities/garage-slot.entity";
import { GarageFloor } from "../entities/garage-floor.entity";
import {
  Valet,
  ValetEmployementStatus,
} from "../../valets/entities/valets.entity";

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

  let manager = null;

  if (garage.managerId) {
    try {
      const { data } = await axios.get(
        `${AUTH_SERVICE_URL}/internal/${garage.managerId}`,
      );

      manager = {
        fullname: data.fullname ?? data.email ?? "Manager",
      };
    } catch {
      manager = null;
    }
  }

  return {
    ...garage,
    manager,
  };
};

export const getAllGarages = async (page = 1, limit = 10) => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);
  const slotRepo = AppDataSource.getRepository(GarageSlot);
  const valetRepo = AppDataSource.getRepository(Valet);

  const [garages, total] = await garageRepo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: "DESC" },
  });

  const enriched = await Promise.all(
    garages.map(async (garage) => {
      let managerName = "Not assigned";

      if (garage.managerId) {
        try {
          const res = await axios.get(
            `${AUTH_SERVICE_URL}/internal/users/${garage.managerId}`,
            {
              headers: {
                "x-user-id": "resource-service",
                "x-user-role": "SERVICE",
              },
            },
          );

          managerName = res.data?.data?.fullname || "Unknown";
        } catch {
          managerName = "Unknown";
        }
      }

      const floorCount = await floorRepo.count({
        where: { garageId: garage.id },
      });

      const slotCount = await slotRepo
        .createQueryBuilder("slot")
        .innerJoin("slot.floor", "floor")
        .where("floor.garageId = :garageId", { garageId: garage.id })
        .getCount();

      const valetCount = await valetRepo.count({
        where: {
          garageId: garage.id,
          employmentStatus: ValetEmployementStatus.ACTIVE,
        },
      });

      return {
        garageId: garage.id,

        garageCode: garage.garageRegistrationNumber,

        name: garage.name,

        managerName,

        contactEmail: garage.contactEmail,

        contactPhone: garage.contactPhone,

        locationName: garage.locationName,

        capacity: garage.capacity,

        floorCount,

        slotCount,

        valetCount,

        status: garage.status,

        createdAt: garage.createdAt,

        companyId: garage.companyId,
      };
    }),
  );

  return {
    data: enriched,

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

  const [garages, total] = await repo.findAndCount({
    where: { companyId },
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: "DESC" },
  });

  const enriched = await Promise.all(
    garages.map(async (garage) => {
      if (!garage.managerId) {
        return { ...garage, manager: null };
      }

      try {
        const { data } = await axios.get(
          `${AUTH_SERVICE_URL}/internal/${garage.managerId}`,
        );

        return {
          ...garage,
          manager: {
            fullname: data.fullname ?? data.email ?? "Manager",
          },
        };
      } catch {
        return { ...garage, manager: null };
      }
    }),
  );

  return {
    data: enriched,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
