"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const error_1 = require("../utils/error");
const error_2 = require("../utils/error");
const authMiddleware = (req, res, next) => {
    try {
        // console.log("Cookies in gateway:", req.cookies);
        console.log("=== AUTH MIDDLEWARE DEBUG ===");
        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.headers.authorization);
        console.log("All headers:", req.headers);
        console.log("===========================");
        const tokenFromCookie = req.cookies?.accessToken;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;
        const token = tokenFromCookie || tokenFromHeader;
        // console.log("Access token used:", token);
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
        console.log("AUTH USER:", req.user);
        req.headers["x-user-role"] = decoded.role;
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
