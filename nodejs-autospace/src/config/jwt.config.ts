import { JwtConfig } from "../types/auth.type";
import { env } from "./env.config";

const jwtconfig: JwtConfig = {
  accessToken: {
    secret: env.JWT_ACCESS_SECRET || "secret-key-access",
    expiresIn: env.JWT_ACCESS_EXPIRY || "15m",
  },
  refreshToken: {
    secret: env.JWT_REFRESH_SECRET || "secret-key-refresh",
    expiresIn: env.JWT_REFRESH_EXPIRY || "7d",
  },
};

export default jwtconfig;
