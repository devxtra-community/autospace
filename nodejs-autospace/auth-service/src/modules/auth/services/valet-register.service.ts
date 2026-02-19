import bcrypt from "bcrypt";
import axios from "axios";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "../constants";
import { ValetRegisterDto } from "@autospace/shared";

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

export const registerValetService = async (data: ValetRegisterDto) => {
  const { fullname, email, phone, password, companyBrn, garageCode } = data;

  const userRepo = AppDataSource.getRepository(User);

  const exists = await userRepo.findOne({
    where: [{ email }, { phone }],
  });
  if (exists) {
    throw new Error("User with this email or phone already exists");
  }

  const { data: resolveData } = await axios.post(
    `${RESOURCE_SERVICE_URL}/internal/valets/resolve-garage`,
    { companyBrn, garageCode },
  );

  const { companyId, garageId } = resolveData;
  if (!companyId || !garageId) {
    throw new Error("Invalid company BRN or garage code");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = userRepo.create({
    fullname,
    email,
    phone,
    password_hash,
    role: UserRole.VALET,
    status: UserStatus.ACTIVE,
    companyId,
    managerState: null,
  });

  const savedUser = await userRepo.save(user);

  try {
    await axios.post(`${RESOURCE_SERVICE_URL}/internal/valets/register`, {
      userId: savedUser.id,
      companyId,
      garageId,
    });
  } catch (err) {
    await userRepo.delete(savedUser.id);
    throw new Error("Valet creation failed, auth user rolled back");
  }

  return {
    id: savedUser.id,
    fullname: savedUser.fullname,
    email: savedUser.email,
    phone: savedUser.phone,
    role: savedUser.role,
  };
};
