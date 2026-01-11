// api-gateway/src/utils/jwt.utils.ts
import jwt from "jsonwebtoken";
import { UserRole, UserStatus } from "../constants/role.enum";

// 🔹 Type for JWT payload (copy from auth-service)
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * ✅ ONLY verification - Gateway doesn't generate tokens
 * Verify access token from incoming requests
 */

export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET not configured in gateway");
  }

  return jwt.verify(token, secret) as JwtPayload;
};
