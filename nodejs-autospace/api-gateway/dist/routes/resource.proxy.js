"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const role_enum_1 = require("../constants/role.enum");
const router = (0, express_1.Router)();
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL;
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
router.use("/public", (req, _res, next) => {
    console.log(" GATEWAY URL:", req.originalUrl);
    console.log(" GATEWAY PATH:", req.url);
    next();
}, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/public${path}`,
}));
router.use("/garages", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.OWNER, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.MANAGER, role_enum_1.UserRole.CUSTOMER, role_enum_1.UserRole.VALET), (0, http_proxy_middleware_1.createProxyMiddleware)({
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
router.use("/valets", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.MANAGER, role_enum_1.UserRole.VALET, role_enum_1.UserRole.CUSTOMER), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        const original = req.originalUrl;
        console.log("REWRITE ORIGINAL:", original);
        // internal routes (used by booking-service / auth-service)
        if (original.includes("/assign") ||
            original.includes("/release") ||
            original.includes("/available") ||
            original.includes("/register") ||
            original.includes("/resolve-garage") ||
            original.includes("/reject")) {
            const newPath = original.replace(/^\/api\/valets/, "/internal/valets");
            console.log("REWRITE INTERNAL:", newPath);
            return newPath;
        }
        // manager / frontend routes
        const newPath = original.replace(/^\/api\/valets/, "/valets");
        console.log("REWRITE PUBLIC:", newPath);
        return newPath;
    },
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
router.use("/files", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/files${path}`,
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
exports.default = router;
