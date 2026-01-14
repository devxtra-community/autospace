"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";
router.use(auth_middleware_1.authMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/": "/companies",
    },
}));
exports.default = router;
