import { JwtConfig } from "../types/auth.type";
import type { SignOptions } from "jsonwebtoken";

const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ||
  "15m") as SignOptions["expiresIn"];
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ||
  "7d") as SignOptions["expiresIn"];

const jwtconfig: JwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "secret-key-access",
    expiresIn: JWT_ACCESS_EXPIRY,
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || "secret-key-refresh",
    expiresIn: JWT_REFRESH_EXPIRY,
  },
};

export default jwtconfig;
