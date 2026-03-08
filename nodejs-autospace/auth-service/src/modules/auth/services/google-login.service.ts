import { OAuth2Client } from "google-auth-library";
import { AppDataSource } from "../../../db/data-source";
import { User } from "../entities/user.entity";
import { env } from "../../../config/env.config";
import { UserRole, UserStatus } from "../constants";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.util";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error("Invalid Google token");
  }

  const email = payload.email;
  const fullname = payload.name;

  const userRepo = AppDataSource.getRepository(User);

  let user = await userRepo.findOne({
    where: { email },
  });

  // create user if not exists
  if (!user) {
    user = userRepo.create({
      email,
      fullname: fullname || "Google User",
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });

    await userRepo.save(user);
  }

  // allow only customers
  if (user.role !== UserRole.CUSTOMER) {
    throw new Error("Google login not allowed for this account");
  }

  // generate tokens
  const tokens = {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };

  return { user, tokens };
};
