// Placeholder for auth service layer
// Business logic will be implemented later
export {};

import { Response, Request } from "express";

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

export const getUserProfile = async (userId: string) => {
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
    ],
  });

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    name: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
  };
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

  return {
    id: user.id,
    name: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};
