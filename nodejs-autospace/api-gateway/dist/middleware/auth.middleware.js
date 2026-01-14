"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const error_1 = require("../utils/error");
const error_2 = require("../utils/error");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            (0, error_1.sendAuthError)(res, error_2.AuthErrorCode.AUTH_REQUIRED, "Authorization header missing", 401);
            return;
        }
        if (!authHeader.startsWith("Bearer ")) {
            (0, error_1.sendAuthError)(res, error_2.AuthErrorCode.TOKEN_INVALID, "Invalid authorization format. Use Bearer <token>", 401);
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            (0, error_1.sendAuthError)(res, error_2.AuthErrorCode.TOKEN_INVALID, "Access token missing", 401);
            return;
        }
        // Verify token and attach to request
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        // Attach full payload to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status,
        };
        req.headers["x-user-id"] = decoded.id;
        next();
    }
    catch (error) {
        let isExpired = false;
        if (error instanceof Error) {
            isExpired = error.name === "TokenExpiredError";
        }
        (0, error_1.sendAuthError)(res, isExpired ? error_2.AuthErrorCode.TOKEN_EXPIRED : error_2.AuthErrorCode.TOKEN_INVALID, isExpired ? "Token has expired" : "Invalid or expired token", 401);
        return;
    }
};
exports.authMiddleware = authMiddleware;
