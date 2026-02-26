export {};

import { Response, Request } from "express";
// import { FindOptionsWhere } from "typeorm";
// test route of protected router //

export const protectedRoute = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Authenticated successfully",
    user: req.user,
  });
};

import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { UpdateProfileInput } from "@autospace/shared";
import { UserRole, UserStatus } from "../constants";
import redisClient from "../../../config/redis";

export const getUserProfile = async (userId: string) => {
  const cacheKey = `user:${userId}`;

  // Check Redis
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("User from Redis");
    return JSON.parse(cached);
  }

  const repo = AppDataSource.getRepository(User);

  const user = await repo.findOne({
    where: { id: userId },
    select: [
      "id",
      "fullname",
      "email",
      "phone",
      "role",
      "status",
      "created_at",
      "companyId",
    ],
  });

  if (!user) throw new Error("User not found");

  const result = {
    id: user.id,
    name: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    companyId: user.companyId,
    createdAt: user.created_at,
  };

  // Store in Redis (10 min)
  await redisClient.set(cacheKey, JSON.stringify(result), { EX: 600 });

  return result;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileInput,
) => {
  const repo = AppDataSource.getRepository(User);

  const user = await repo.findOne({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (data.name !== undefined) user.fullname = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.phone !== undefined) user.phone = data.phone;

  await repo.save(user);
  await redisClient.del(`user:${userId}`);

  return {
    id: user.id,
    name: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

export const getAllUsersService = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}) => {
  const repo = AppDataSource.getRepository(User);

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const qb = repo.createQueryBuilder("user");

  qb.select([
    "user.id",
    "user.fullname",
    "user.email",
    "user.phone",
    "user.status",
    "user.role",
    "user.created_at",
  ]);

  /* SEARCH */
  if (filters.search) {
    qb.andWhere(
      `(user.fullname ILIKE :search
     OR user.email ILIKE :search
     OR user.phone ILIKE :search)`,
      { search: `%${filters.search}%` },
    );
  }

  /* ROLE */
  if (filters.role) {
    qb.andWhere("user.role = :role", {
      role: filters.role,
    });
  }

  /* STATUS */
  if (filters.status) {
    qb.andWhere("user.status = :status", {
      status: filters.status,
    });
  }

  /* PAGINATION */
  qb.orderBy("user.created_at", "DESC").skip(skip).take(limit);

  const [users, total] = await qb.getManyAndCount();

  return {
    data: users.map((u) => ({
      userId: u.id,
      fullname: u.fullname,
      email: u.email,
      phone: u.phone,
      dateJoined: u.created_at,
      status: u.status,
      role: u.role,
    })),

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
