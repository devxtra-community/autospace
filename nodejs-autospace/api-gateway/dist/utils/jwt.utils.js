"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
// api-gateway/src/utils/jwt.utils.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * ✅ ONLY verification - Gateway doesn't generate tokens
 * Verify access token from incoming requests
 */
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET not configured in gateway");
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyAccessToken = verifyAccessToken;
