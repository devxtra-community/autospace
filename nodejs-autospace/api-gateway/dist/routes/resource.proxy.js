"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const role_enum_1 = require("../constants/role.enum");
const router = (0, express_1.Router)();
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";
const attachUserHeaders = (proxyReq, req) => {
    if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.id);
        proxyReq.setHeader("x-user-role", req.user.role);
        proxyReq.setHeader("x-user-email", req.user.email);
    }
    if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
    }
};
router.use("/companies", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.OWNER, role_enum_1.UserRole.ADMIN), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/companies${path}`,
    on: {
        proxyReq: (proxyReq, req) => {
            attachUserHeaders(proxyReq, req);
            if (req.body &&
                Object.keys(req.body).length > 0 &&
                ["POST", "PUT", "PATCH"].includes(req.method)) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
    },
}));
router.use("/public/garages", (req, _res, next) => {
    console.log(" GATEWAY URL:", req.originalUrl);
    console.log(" GATEWAY PATH:", req.url);
    next();
}, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    router: () => `${RESOURCE_SERVICE_URL}/garages`,
}));
router.use("/garages", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.OWNER, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.MANAGER), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/garages${path}`,
    on: {
        proxyReq: (proxyReq, req) => {
            attachUserHeaders(proxyReq, req);
            if (req.body &&
                Object.keys(req.body).length > 0 &&
                ["POST", "PUT", "PATCH"].includes(req.method)) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
    },
}));
// slots routes
router.use("/slots", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.MANAGER), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/slots${path}`,
    on: {
        proxyReq: (proxyReq, req) => {
            attachUserHeaders(proxyReq, req);
        },
    },
}));
// valet routes
router.use("/valet", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.MANAGER, role_enum_1.UserRole.VALET), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/valet${path}`,
    on: {
        proxyReq: (proxyReq, req) => {
            attachUserHeaders(proxyReq, req);
        },
    },
}));
router.use("/files", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => path,
}));
exports.default = router;
