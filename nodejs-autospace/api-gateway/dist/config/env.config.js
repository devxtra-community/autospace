"use strict";
// function getEnv(key: string): string {
//   const value = process.env[key];
//   if (!value) throw new Error(`Missing env: ${key}`);
//   return value;
// }
Object.defineProperty(exports, "__esModule", { value: true });
// export const config = {
//   port: process.env.GATEWAY_PORT || 4000,
//   authServiceUrl: getEnv("AUTH_SERVICE_URL"),
//   bookingServiceUrl: getEnv("BOOKING_SERVICE_URL"),
//   resourceServiceUrl: getEnv("RESOURCE_SERVICE_URL"),
//   jwtAccessSecret: getEnv("JWT_ACCESS_SECRET"),
//   jwtrefreshsecret: getEnv("JWT_REFRESH_SECRET"),
//   jwtaccessexpiry: getEnv("JWT_ACCESS_EXPIRY"),
//   jwtrefreshexpiry: getEnv("JWT_REFRESH_EXPIRY"),
//   internalServiceToken: getEnv("INTERNAL_SERVICE_TOKEN"),
//   frontendUrl: getEnv("FRONTEND_URL"),
//   databaseUrl: getEnv("DATABASE_URL"),
//   cookieDomain: getEnv("COOKIE_DOMAIN"),
//   nodeEnv: process.env.NODE_ENV || "development",
// };
// // Validate required env vars
// const requiredEnv = [
//   "AUTH_SERVICE_URL",
//   "BOOKING_SERVICE_URL",
//   "RESOURCE_SERVICE_URL",
//   "JWT_ACCESS_SECRET",
//   "JWT_REFRESH_SECRET",
//   "JWT_ACCESS_EXPIRY",
//   "JWT_REFRESH_EXPIRY",
//   "INTERNAL_SERVICE_TOKEN",
//   "FRONTEND_URL",
//   "DATABASE_URL",
//   "COOKIE_DOMAIN",
//   "NODE_ENV",
// ];
// requiredEnv.forEach((env) => {
//   if (!process.env[env]) {
//     throw new Error(`Environment variable ${env} is missing`);
//   }
// });
