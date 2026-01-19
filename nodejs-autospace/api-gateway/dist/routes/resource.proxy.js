"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const role_enum_1 = require("../constants/role.enum");
const router = (0, express_1.Router)();
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";
// company routes
router.use("/companies", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.OWNER, role_enum_1.UserRole.ADMIN), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/companies${path}`,
}));
// garage routes
router.use("/garages", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.OWNER, role_enum_1.UserRole.ADMIN), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/garages${path}`,
}));
exports.default = router;
