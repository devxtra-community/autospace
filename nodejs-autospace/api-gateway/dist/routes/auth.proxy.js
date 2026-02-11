"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const express_2 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const role_enum_1 = require("../constants/role.enum");
const router = (0, express_1.Router)();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
router.use(express_2.default.json());
router.use(express_2.default.urlencoded({ extended: true }));
router.get("/me", auth_middleware_1.authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
});
const createAuthProxy = (targetPath) => {
    return async (req, res) => {
        try {
            const url = `${AUTH_SERVICE_URL}${targetPath}`;
            const response = await (0, axios_1.default)({
                method: req.method,
                url,
                data: req.body,
                headers: {
                    "Content-Type": "application/json",
                    Cookie: req.headers.cookie || "",
                    ...(req.user && {
                        "x-user-id": req.user.id,
                        "x-user-role": req.user.role,
                        "x-user-email": req.user.email,
                    }),
                },
                timeout: 10000,
                validateStatus: () => true,
            });
            if (response.headers["set-cookie"]) {
                res.setHeader("Set-Cookie", response.headers["set-cookie"]);
            }
            res.status(response.status).json(response.data);
        }
        catch (error) {
            console.error("Auth proxy error:", error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                    return res.status(504).json({
                        success: false,
                        message: "Auth service timeout",
                    });
                }
                if (error.response) {
                    return res.status(error.response.status).json(error.response.data);
                }
            }
            res.status(500).json({
                success: false,
                message: "Gateway error",
            });
        }
    };
};
router.post("/login", rateLimiter_middleware_1.authRateLimiter, createAuthProxy("/api/login"));
router.post("/register", rateLimiter_middleware_1.authRateLimiter, createAuthProxy("/api/register"));
router.post("/logout", rateLimiter_middleware_1.authRateLimiter, createAuthProxy("/api/logout"));
router.post("/refresh", createAuthProxy("/api/refresh"));
router.post("/owner/register", createAuthProxy("/api/owner/register"));
router.post("/manager/register", createAuthProxy("/api/manager/register"));
router.post("/valet/register", createAuthProxy("/api/valet/register"));
router.get("/admin/allusers", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbac)(role_enum_1.UserRole.ADMIN), createAuthProxy("/api/admin/allusers"));
router.get("/profile/my", auth_middleware_1.authMiddleware, createAuthProxy("/api/profile/my"));
router.patch("/profile/my", auth_middleware_1.authMiddleware, createAuthProxy("/api/profile/my"));
router.use("/manager", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const targetUrl = AUTH_SERVICE_URL + req.originalUrl.replace("/api/auth", "/api");
        const response = await (0, axios_1.default)({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                "Content-Type": "application/json",
                ...(req.user && {
                    "x-user-id": req.user.id,
                    "x-user-role": req.user.role,
                    "x-user-email": req.user.email,
                }),
            },
            validateStatus: () => true,
        });
        return res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Manager proxy error:", err);
        return res.status(500).json({
            success: false,
            message: "Gateway manager proxy error",
        });
    }
});
exports.default = router;
