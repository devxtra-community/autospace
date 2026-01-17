import bcrypt from "bcrypt";
import axios from "axios";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "../constants";
import { ManagerState } from "../constants/manager-state.enum";
import { ManagerRegisterDto } from "@autospace/shared";

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

export const registerManager = async (data: ManagerRegisterDto) => {
  const { fullname, email, phone, password, businessRegistrationNumber } = data;

  const userRepo = AppDataSource.getRepository(User);

  let companyId: string;

  try {
    const response = await axios.get(
      `${RESOURCE_SERVICE_URL}/companies/internal/brn/${businessRegistrationNumber}/validate`,
      { timeout: 3000 },
    );

    if (!response.data.valid) {
      throw new Error("Invalid or inactive company");
    }

    companyId = response.data.companyId;
  } catch (err: any) {
    throw err;
  }

  const existing = await userRepo.findOne({
    where: [{ email }, { phone }],
  });

  if (existing) {
    throw new Error("Email or phone already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const manager = userRepo.create({
    fullname,
    email,
    phone,
    password_hash: passwordHash,
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    companyId,
    managerState: ManagerState.UNASSIGNED,
  });

  const saved = await userRepo.save(manager);

  return {
    id: saved.id,
    fullname: saved.fullname,
    email: saved.email,
    role: saved.role,
    status: saved.status,
    companyId: saved.companyId,
    managerState: saved.managerState,
    createdAt: saved.created_at,
  };
};
