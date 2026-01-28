import jwt from "jsonwebtoken";

import { env } from "../config/env.config";

import {
  JwtPayload,
  RefreshTokenPayload,
  TokenResponse,
} from "../types/auth.type";

console.log("jwtexpirtaccesss", env.JWT_ACCESS_EXPIRY);

export const generateAccessToken = (Payload: JwtPayload): string => {
  return jwt.sign(Payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
};

export const generateRefreshToken = (Payload: RefreshTokenPayload): string => {
  return jwt.sign(Payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
};

export const generateTokenPair = (payload: JwtPayload): TokenResponse => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: payload.id }),
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
