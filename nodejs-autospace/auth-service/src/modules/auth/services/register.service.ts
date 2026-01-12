import bcrypt from "bcrypt";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { RegisterApiInput } from "../validators/auth.api.schema";
import { UserRole, UserStatus } from "../constants";

export const registerUser = async (data: RegisterApiInput) => {
  const { fullname, email, phone, password, role } = data;

  const userRepo = AppDataSource.getRepository(User);

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  //  Convert string to enum externally
  const userRole = role as UserRole;

  const status: UserStatus =
    userRole === UserRole.CUSTOMER || userRole === UserRole.ADMIN
      ? UserStatus.ACTIVE
      : UserStatus.PENDING;

  // Create user entity
  const user = userRepo.create({
    fullname,
    email,
    phone,
    password_hash: passwordHash,
    role: userRole,
    status,
  });

  const savedUser = await userRepo.save(user);

  return {
    id: savedUser.id,
    email: savedUser.email,
    role: savedUser.role,
    status: savedUser.status,
    created_at: savedUser.created_at,
  };
};
