import { Request } from "express";
import { SignOptions } from "jsonwebtoken";
import { UserRole, UserStatus } from "../modules/auth/constants";

// JWT Payload for Access Token
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// JWT Payload for Refresh Token
export interface RefreshTokenPayload {
  id: string;
}

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Token Response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// JWT Configuration Interface
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

// Refresh Token Document Interface
export interface IRefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
}
