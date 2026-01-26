import bcrypt from "bcrypt";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { LoginApiInput } from "../validators/auth.api.schema";
import { UserRole, UserStatus } from "../constants";
import { generateTokenPair } from "../../../utils/jwt.util";
import { hashToken } from "../../../utils/hash.utils";

export interface LoginUserResult {
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const loginUser = async (
  data: LoginApiInput,
): Promise<LoginUserResult> => {
  const { email, password } = data;

  const userRepo = AppDataSource.getRepository(User);
  const refreshRepo = AppDataSource.getRepository(RefreshToken);

  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPassword = await bcrypt.compare(password, user.password_hash);
  if (!isPassword) {
    throw new Error("Invalid credentials");
  }

  if (
    (user.role === UserRole.OWNER ||
      user.role === UserRole.MANAGER ||
      user.role === UserRole.VALET) &&
    user.status !== "active"
  ) {
    throw new Error("User not approved");
  }

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: user.status as UserStatus,
  });

  await refreshRepo.save({
    token_hash: hashToken(tokens.refreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    user,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      status: user.status as UserStatus,
    },
    tokens,
  };
};
