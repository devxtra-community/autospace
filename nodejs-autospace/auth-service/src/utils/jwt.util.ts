import jwt from "jsonwebtoken";

import { env } from "../config/env.config";

import {
  JwtPayload,
  RefreshTokenPayload,
  TokenResponse,
} from "../types/auth.type";

// console.log("ACCESS SECRET (sign):", env.JWT_ACCESS_SECRET);

export const generateAccessToken = (Payload: JwtPayload): string => {
  return jwt.sign(Payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}; // genarating the access token //

export const generateRefreshToken = (Payload: RefreshTokenPayload): string => {
  return jwt.sign(Payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  }); // genarate refresh token //
};

export const generateTokenPair = (payload: JwtPayload): TokenResponse => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: payload.id }),
  };
}; //    * Generate access + refresh token pair  * Used during login //

// export const verifyAccessToken = (token: string): JwtPayload => {
//   return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
// }; //  * Verify access token * Throws error if token is invalid or expired

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}; // * Verify refresh token *Throws error if token is incalid or expored
