"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
console.log("jwtexpirtaccesss", env_config_1.env.JWT_ACCESS_EXPIRY);
const generateAccessToken = (Payload) => {
    return jsonwebtoken_1.default.sign(Payload, env_config_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_config_1.env.JWT_ACCESS_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (Payload) => {
    return jsonwebtoken_1.default.sign(Payload, env_config_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_config_1.env.JWT_REFRESH_EXPIRY,
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
    return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
