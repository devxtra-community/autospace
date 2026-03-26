"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
console.log("jwtexpirtaccesss", process.env.JWT_ACCESS_EXPIRY);
const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || "15m");
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || "7d");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const generateAccessToken = (Payload) => {
    return jsonwebtoken_1.default.sign(Payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (Payload) => {
    return jsonwebtoken_1.default.sign(Payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const generateTokenPair = (payload) => {
    return {
        accessToken: (0, exports.generateAccessToken)(payload),
        refreshToken: (0, exports.generateRefreshToken)({ id: payload.id }),
    };
};
exports.generateTokenPair = generateTokenPair;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
