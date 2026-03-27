import jwt, { SignOptions } from "jsonwebtoken";

// import { env } from "../config/env.config";

import {
  JwtPayload,
  RefreshTokenPayload,
  TokenResponse,
} from "../types/auth.type";

console.log("jwtexpirtaccesss", process.env.JWT_ACCESS_EXPIRY);

const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ||
  "15m") as SignOptions["expiresIn"];
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ||
  "7d") as SignOptions["expiresIn"];
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (Payload: JwtPayload): string => {
  return jwt.sign(Payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
};

export const generateRefreshToken = (Payload: RefreshTokenPayload): string => {
  return jwt.sign(Payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
};

export const generateTokenPair = (payload: JwtPayload): TokenResponse => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: payload.id }),
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
