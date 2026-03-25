import bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "../constants";
import { AppDataSource } from "../../../db/data-source";
import { OwnerRegisterDto } from "../validators/auth.api.schema";

export const registerOwner = async (data: OwnerRegisterDto) => {
  const { fullname, email, phone, password } = data;
  const ownerRepo = AppDataSource.getRepository(User);

  const existing = await ownerRepo.findOne({
    where: [{ email }, { phone }],
  });
  if (existing) {
    throw new Error("Email or Phone already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = ownerRepo.create({
    fullname,
    email,
    phone,
    password_hash: passwordHash,
    role: UserRole.OWNER,
    status: UserStatus.ACTIVE,
  });

  const savedUser = await ownerRepo.save(user);

  return {
    id: savedUser.id,
    email: savedUser.email,
    role: savedUser.role,
    status: savedUser.status,
    created_at: savedUser.created_at,
  };
};

// admin get user login stats

export const getUserLoginStatsService = async () => {
  const repo = AppDataSource.getRepository(User);

  const result = await repo
    .createQueryBuilder("user")
    .select("TO_CHAR(user.created_at, 'Mon')", "month")
    .addSelect("COUNT(user.id)", "users")
    .groupBy("month")
    .orderBy("MIN(user.created_at)", "ASC")
    .getRawMany();

  return result;
};
