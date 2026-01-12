// api-gateway/src/config/env.config.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.GATEWAY_PORT || 4000,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  bookingServiceUrl: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
  resourceServiceUrl:
    process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Validate required env vars
if (!config.jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET is required");
}
