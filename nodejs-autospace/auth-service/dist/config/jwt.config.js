"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || "15m");
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || "7d");
const jwtconfig = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || "secret-key-access",
        expiresIn: JWT_ACCESS_EXPIRY
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || "secret-key-refresh",
        expiresIn: JWT_REFRESH_EXPIRY
    },
};
exports.default = jwtconfig;
