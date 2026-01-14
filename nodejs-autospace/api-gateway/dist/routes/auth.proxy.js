"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const router = (0, express_1.Router)();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
router.use("/login", rateLimiter_middleware_1.authRateLimiter);
router.use("/register", rateLimiter_middleware_1.authRateLimiter);
router.use("/me", auth_middleware_1.authMiddleware);
// router.use("/refresh");
router.use((0, http_proxy_middleware_1.createProxyMiddleware)({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/login": "/api/login",
        "^/register": "/api/register",
        "^/refresh": "/api/refresh",
        "^/me": "/api/me",
        "^/owner/register": "/api/owner/register",
    },
    timeout: 10000,
    proxyTimeout: 10000,
}));
exports.default = router;
