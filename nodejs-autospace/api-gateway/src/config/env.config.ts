// api-gateway/src/config/env.config.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.GATEWAY_PORT || 4000,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  authServiceUrl: process.env.AUTH_SERVICE_URL!,
  bookingServiceUrl: process.env.BOOKING_SERVICE_URL!,
  resourceServiceUrl: process.env.RESOURCE_SERVICE_URL!,
  nodeEnv: process.env.NODE_ENV || "development",
};

// Validate required env vars
const requiredEnv = [
  "AUTH_SERVICE_URL",
  "BOOKING_SERVICE_URL",
  "RESOURCE_SERVICE_URL",
  "JWT_ACCESS_SECRET",
  "INTERNAL_SERVICE_TOKEN",
  "FRONTEND_URL",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} is missing`);
  }
});

// Validate required env vars
if (!config.jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET is required");
}
