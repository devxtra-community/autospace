"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}
const NODE_ENV = process.env.NODE_ENV ?? "development";
exports.env = {
    NODE_ENV,
    PORT: Number(process.env.PORT ?? 4001),
    DATABASE_URL: requireEnv("DATABASE_URL"),
    JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
    JWT_ACCESS_EXPIRY: requireEnv("JWT_ACCESS_EXPIRY"),
    JWT_REFRESH_EXPIRY: requireEnv("JWT_REFRESH_EXPIRY"),
    COOKIE_SECURE: false,
    COOKIE_SAMESITE: "lax",
    GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
};
