"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAndVerify = exports.extractToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const verifyToken = (token) => {
    if (!env_1.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET not configured");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "TokenExpiredError") {
                throw new Error("Token has expired");
            }
            if (error.name === "JsonWebTokenError") {
                throw new Error("Invalid token");
            }
            throw new Error(`Token verification failed: ${error.message}`);
        }
        throw new Error("Token verification failed: Unknown error");
    }
};
exports.verifyToken = verifyToken;
const extractToken = (authHeader) => {
    if (!authHeader) {
        throw new Error("Authorization Header missing");
    }
    if (!authHeader.startsWith("Bearer")) {
        throw new Error("Header dont have bearer token");
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        throw new Error("token is missing");
    }
    return token;
};
exports.extractToken = extractToken;
const extractAndVerify = (authHeader) => {
    const token = (0, exports.extractToken)(authHeader);
    return (0, exports.verifyToken)(token);
};
exports.extractAndVerify = extractAndVerify;
