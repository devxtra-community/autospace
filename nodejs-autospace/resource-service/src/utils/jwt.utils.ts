import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types/auth.type";

export const verifyToken = (token: string): JwtPayload => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET not configured");
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }

    throw new Error("Token verification failed: Unknown error");
  }
};

export const extractToken = (authHeader?: string): string => {
  if (!authHeader) {
    throw new Error("Authorization Header missing");
  }
  if (!authHeader.startsWith("Bearer")) {
    throw new Error("Header dont have bearer token");
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    throw new Error("token is missing");
  }

  return token;
};

export const extractAndVerify = (authHeader?: string): JwtPayload => {
  const token = extractToken(authHeader);
  return verifyToken(token);
};
