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
import { ILike } from "typeorm";

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

  if (!company) throw new Error("Active company not found");

  const garage = await garageRepo.findOne({
    where: {
      garageRegistrationNumber: garageCode,
      companyId: company.id,
      status: GarageStatus.ACTIVE,
    },
  });

  if (!garage) throw new Error("Garage not found");

  if (garage.managerId) throw new Error("Garage already has manager");

  // FIXED endpoint
  const res = await axios.get(
    `${AUTH_SERVICE_URL}/internal/users/${managerId}`,
    {
      headers: {
        "x-user-id": "resource-service",
        "x-user-role": "SERVICE",
      },
    },
  );

  const manager = res.data.data;

  if (!manager) throw new Error("Manager not found");

  if (manager.role !== "manager") throw new Error("User is not manager");

  if (manager.companyId !== company.id)
    throw new Error("Manager not from this company");

  if (manager.managerState !== "unassigned")
    throw new Error("Manager already assigned");

  garage.managerId = managerId;

  await garageRepo.save(garage);

  await axios.post(
    `${AUTH_SERVICE_URL}/internal/users/${managerId}/assign`,
    {},
    {
      headers: {
        "x-user-id": "resource-service",
        "x-user-role": "SERVICE",
      },
    },
  );

  return {
    garageCode,
    managerId,
  };
};

export const getGarageById = async (garageId: string) => {
  const repo = AppDataSource.getRepository(Garage);

  const garage = await repo.findOne({
    where: { id: garageId },
  });

  if (!garage) {
    throw new Error("Garage not found");
  }

  if (!garage.managerId) {
    return {
      ...garage,
      manager: null,
    };
  }

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

    const user = res.data?.data;

    return {
      ...garage,
      manager: user
        ? {
            fullname: user.fullname || user.email || "Manager",
          }
        : null,
    };
  } catch {
    return {
      ...garage,
      manager: null,
    };
  }
};

export const getAllGarages = async (
  page = 1,
  limit = 10,
  search?: string,
  status?: string,
) => {
  const garageRepo = AppDataSource.getRepository(Garage);
  const floorRepo = AppDataSource.getRepository(GarageFloor);
  const slotRepo = AppDataSource.getRepository(GarageSlot);
  const valetRepo = AppDataSource.getRepository(Valet);

  const where: any = {};

  // search filter
  if (search) {
    where.name = ILike(`%${search}%`);
  }

  // status filter
  if (status && status !== "all") {
    where.status = status;
  }

  const [garages, total] = await garageRepo.findAndCount({
    where,
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
        .where("floor.garageId = :garageId", {
          garageId: garage.id,
        })
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

interface GarageFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  managerFilter?: "assigned" | "unassigned";
}

export const getGaragesByCompanyId = async (
  companyId: string,
  filters: GarageFilters,
) => {
  const repo = AppDataSource.getRepository(Garage);

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const search = filters.search;
  const status = filters.status;

  const qb = repo
    .createQueryBuilder("garage")
    .where("garage.companyId = :companyId", { companyId });

  /* SEARCH */
  if (search) {
    qb.andWhere(
      `(LOWER(garage.name) LIKE :search
        OR LOWER(garage.locationName) LIKE :search
        OR LOWER(garage.garageRegistrationNumber) LIKE :search)`,
      { search: `%${search.toLowerCase()}%` },
    );
  }

  if (filters.managerFilter === "assigned") {
    qb.andWhere("garage.managerId IS NOT NULL");
  }

  if (filters.managerFilter === "unassigned") {
    qb.andWhere("garage.managerId IS NULL");
  }

  /* STATUS FILTER */
  if (status) {
    qb.andWhere("garage.status = :status", { status });
  }

  qb.orderBy("garage.createdAt", "DESC")
    .skip((page - 1) * limit)
    .take(limit);

  const [garages, total] = await qb.getManyAndCount();

  /* ENRICH MANAGER */
  const enriched = await Promise.all(
    garages.map(async (garage) => {
      if (!garage.managerId) {
        return { ...garage, manager: null };
      }

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

        const user = res.data?.data;

        return {
          ...garage,
          manager: user
            ? {
                fullname: user.fullname || user.email || "Manager",
              }
            : null,
        };
      } catch {
        return {
          ...garage,
          manager: null,
        };
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
