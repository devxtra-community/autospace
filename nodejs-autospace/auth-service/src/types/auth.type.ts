import { Request } from "express";
import { SignOptions } from "jsonwebtoken";
import { UserRole, UserStatus } from "../modules/auth/constants";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface RefreshTokenPayload {
  id: string;
}
export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtConfig {
  accessToken: {
    secret: string;
    expiresIn: SignOptions["expiresIn"];
  };

  refreshToken: {
    secret: string;
    expiresIn: SignOptions["expiresIn"];
  };
}

export interface IRefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface RequestContext<TQuery = unknown, TBody = unknown> {
  query?: TQuery;
  body?: TBody;
}
