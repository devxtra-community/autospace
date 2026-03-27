"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authTokenMiddleware = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const garage_status_middleware_1 = require("./garage-status.middleware");
const authTokenMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const user = (0, jwt_utils_1.extractAndVerify)(authHeader);
        req.user = user;
        (0, garage_status_middleware_1.requireActiveGarage)(req, res, next);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({
                success: false,
                message: error.message,
            });
        }
        res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.authTokenMiddleware = authTokenMiddleware;
// For  when there route for not required authentication
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const user = (0, jwt_utils_1.extractAndVerify)(authHeader);
            req.user = user;
        }
        next();
    }
    catch (error) {
        console.log(error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
