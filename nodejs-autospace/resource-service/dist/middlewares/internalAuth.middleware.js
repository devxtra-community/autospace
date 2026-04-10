"use strict";
// resource/middlewares/internal-auth.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAuth = void 0;
const auth_type_1 = require("../types/auth.type");
const garage_status_middleware_1 = require("./garage-status.middleware");
const internalAuth = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const email = req.headers["x-user-email"];
    if (!userId || !role) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Missing gateway identity",
        });
    }
    // Validate internal service token if provided
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    if (process.env.INTERNAL_SERVICE_TOKEN &&
        token !== process.env.INTERNAL_SERVICE_TOKEN) {
        console.warn(`Internal token mismatch for user ${userId}`);
        // For now, only log warn or enforce? Let's enforce for security.
        return res.status(403).json({
            success: false,
            message: "Forbidden - Invalid internal service token",
        });
    }
    req.user = {
        id: userId,
        role,
        email: email ?? "",
        status: auth_type_1.UserStatus.ACTIVE,
    };
    (0, garage_status_middleware_1.requireActiveGarage)(req, res, next);
};
exports.internalAuth = internalAuth;
