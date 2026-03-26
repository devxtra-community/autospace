"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const role_enum_1 = require("../constants/role.enum");
const router = (0, express_1.Router)();
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL;
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
router.use("/bookings", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.CUSTOMER, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER, role_enum_1.UserRole.MANAGER, role_enum_1.UserRole.VALET), (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/bookings${path}`,
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
router.use("/payment", auth_middleware_1.authMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/payment${path}`,
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
router.use("/payments/webhook", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/payments/webhook": "/payments/webhook",
    },
}));
exports.default = router;
