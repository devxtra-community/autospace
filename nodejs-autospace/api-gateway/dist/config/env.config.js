"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// api-gateway/src/config/env.config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.GATEWAY_PORT || 4000,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
    bookingServiceUrl: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
    resourceServiceUrl: process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
    nodeEnv: process.env.NODE_ENV || "development",
};
// Validate required env vars
if (!exports.config.jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is required");
}
