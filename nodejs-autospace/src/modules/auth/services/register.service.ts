import bcrypt from "bcrypt";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { RegisterApiInput } from "../validators/auth.api.schema";
import { UserRole, UserStatus } from "../constants";

export const registerUser = async (data: RegisterApiInput) => {
  const { email, password, role } = data;

  const userRepo = AppDataSource.getRepository(User);

  //  Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  //  Determine status based on role
  const status: UserStatus =
    role === "customer" || role === "admin"
      ? UserStatus.ACTIVE
      : UserStatus.PENDING;

  //  Create user entity
  const user = userRepo.create({
    email,
    password_hash: passwordHash,
    role,
    status,
  });

  // Save to DB
  const savedUser = await userRepo.save(user);

  // Return same shape as before
  return {
    id: savedUser.id,
    email: savedUser.email,
    role: savedUser.role as UserRole,
    status: savedUser.status as UserStatus,
    created_at: savedUser.created_at,
  };
};
