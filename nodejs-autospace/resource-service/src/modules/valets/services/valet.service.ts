import { AppDataSource } from "../../../db/data-source";
import {
  Valet,
  ValetAvailabilityStatus,
  ValetEmployementStatus,
} from "../entities/valets.entity";
import { Garage } from "../../garage/entities/garage.entity";
import axios from "axios";
import { publishEvent } from "../../../config/rabbitmq";

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

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

type SimpleUser = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
};

interface Filters {
  page?: number;
  limit?: number;
  employmentStatus?: ValetEmployementStatus;
  availabilityStatus?: ValetAvailabilityStatus;
  search?: string;
}

export const getValetsByGarageService = async (
  garageId: string,
  managerUserId: string,
  filters: Filters,
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  const garageRepo = AppDataSource.getRepository(Garage);

  const garage = await garageRepo.findOne({
    where: { id: garageId },
  });

  if (!garage) throw new Error("Garage not found");

  if (garage.managerId !== managerUserId) throw new Error("Not manager");

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    garageId,
  };

  if (filters.employmentStatus)
    where.employmentStatus = filters.employmentStatus;

  if (filters.availabilityStatus)
    where.availabilityStatus = filters.availabilityStatus;

  const [valets, total] = await valetRepo.findAndCount({
    where,
    skip,
    take: limit,
    order: {
      createdAt: "DESC",
    },
  });

  const users: SimpleUser[] = await Promise.all(
    valets.map(async (valet) => {
      try {
        const res = await axios.get(
          `${AUTH_SERVICE_URL}/internal/users/${valet.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
              "x-user-id": "resource-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        return res.data.data;
      } catch {
        return {
          id: valet.id,
          fullname: "",
          email: "",
          phone: "",
        };
      }
    }),
  );

  let data = valets.map((valet) => {
    const user = users.find((u) => u.id === valet.id);

    return {
      id: valet.id,
      name: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      employmentStatus: valet.employmentStatus,
      availabilityStatus: valet.availabilityStatus,
      createdAt: valet.createdAt,
    };
  });

  if (filters.search) {
    const s = filters.search.toLowerCase();

    data = data.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        v.email.toLowerCase().includes(s) ||
        v.phone.toLowerCase().includes(s),
    );
  }

  return {
    data,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
    })
    .orderBy("valet.createdAt", "ASC") // oldest first
    .limit(1);

  if (excludeIds?.length) {
    query.andWhere("valet.id NOT IN (:...excludeIds)", {
      excludeIds,
    });
  }

  const valet = await query.getOne();

  if (!valet) return null;

  // fetch user
  try {
    const res = await axios.get(
      `${AUTH_SERVICE_URL}/internal/users/${valet.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
        },
      },
    );

    const user = res.data.data;

    return {
      id: valet.id,
      name: user?.fullname ?? "",
      phone: user?.phone ?? "",
      availabilityStatus: valet.availabilityStatus,
      employmentStatus: valet.employmentStatus,
      garageId: valet.garageId,
    };
  } catch {
    return {
      id: valet.id,
      name: "",
      phone: "",
      availabilityStatus: valet.availabilityStatus,
      employmentStatus: valet.employmentStatus,
      garageId: valet.garageId,
    };
  }
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

export const getAllActiveValetsService = async (garageId: string) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const valets = await valetRepo.find({
    where: {
      garageId,
      employmentStatus: ValetEmployementStatus.ACTIVE,
      availabilityStatus: ValetAvailabilityStatus.AVAILABLE,
    },
    order: {
      createdAt: "ASC",
    },
  });

  const users = await Promise.all(
    valets.map(async (valet) => {
      try {
        const res = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/internal/users/${valet.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        return res.data.data;
      } catch {
        return null;
      }
    }),
  );

  return valets.map((valet, index) => {
    const user = users[index];

    return {
      id: valet.id,
      name: user?.fullname || "",
      phone: user?.phone || "",
      email: user?.email || "",
      availabilityStatus: valet.availabilityStatus,
      employmentStatus: valet.employmentStatus,
      garageId: valet.garageId,
    };
  });
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

export const assignValetToBooking = async (
  bookingId: string,
  garageId: string,
) => {
  const valet = await getAvailableValetService(garageId);

  if (!valet) {
    console.log("No available valet");
    return;
  }

  const valetId = valet.id;

  await publishEvent("valet.request.created", {
    bookingId,
    valetId,
  });

  console.log("Valet request created:", {
    bookingId,
    valetId,
  });
};
