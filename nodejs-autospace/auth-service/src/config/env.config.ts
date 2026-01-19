import type { SignOptions } from "jsonwebtoken";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const NODE_ENV = process.env.NODE_ENV ?? "development";

export const env = {
  // core
  NODE_ENV,
  PORT: Number(process.env.PORT ?? 4001),

  // database
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // jwt
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),

  JWT_ACCESS_EXPIRY: requireEnv(
    "JWT_ACCESS_EXPIRY",
  ) as SignOptions["expiresIn"],

  JWT_REFRESH_EXPIRY: requireEnv(
    "JWT_REFRESH_EXPIRY",
  ) as SignOptions["expiresIn"],

  // cookies (derived, NOT from .env)
  COOKIE_SECURE: NODE_ENV === "production",
  COOKIE_SAMESITE: NODE_ENV === "production" ? "none" : "lax",
} as const;
