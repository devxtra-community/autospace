import { AppDataSource } from "../../../db/data-source";
import { Valet, ValetStatus } from "../entities/valets.entity";
import { getValetsByGarageService } from "./valet.service";

// Get all company valets (for owner)
export const getCompanyValetsService = async (
  companyId: string,
  //   ownerUserId: string,
  filters: {
    status?: ValetStatus;
    page: number;
    limit: number;
  },
) => {
  const valetRepo = AppDataSource.getRepository(Valet);
  // Note: You might want to verify ownerUserId owns this company
  // For now, assuming gateway already validated this

  // Build query
  const where: any = { companyId };
  if (filters.status) {
    where.status = filters.status;
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

// Get valet by ID
export const getValetByIdService = async (valetId: string) => {
  const valetRepo = AppDataSource.getRepository(Valet);

  const valet = await valetRepo.findOne({
    where: { id: valetId },
  });

  if (!valet) {
    throw new Error("Valet not found");
  }

  return valet;
};

// Get pending valets for a garage (manager)
export const getPendingValetsService = async (
  garageId: string,
  managerUserId: string,
  page: number = 1,
  limit: number = 10,
) => {
  return await getValetsByGarageService(garageId, managerUserId, {
    status: ValetStatus.PENDING,
    page,
    limit,
  });
};
