import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter.middleware";
import type { Response } from "express";
import { Socket } from "net";

const router = Router();

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001";

router.use(
  "/register",
  authRateLimiter,
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth/register": "/auth/register" },

    on: {
      error(err, _req, res) {
        console.error("Auth proxy error:", err);

        // If it's a raw socket, just destroy it
        if (res instanceof Socket) {
          res.destroy();
          return;
        }

        // Now TypeScript KNOWS this is Express.Response
        const expressRes = res as Response;

        expressRes.status(503).json({
          success: false,
          message: "Auth service unavailable",
        });
      },
    },
  }),
);

router.use(
  "/login",
  authRateLimiter,
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth/login": "/auth/login" },
  }),
);

router.use(
  "/me",
  authMiddleware,
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth/me": "/auth/me" },
  }),
);

router.use(
  "/refresh",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth/refresh": "/auth/refresh" },
  }),
);

export default router;
