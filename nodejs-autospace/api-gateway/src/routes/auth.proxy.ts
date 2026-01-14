import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001";

router.use("/login", authRateLimiter);
router.use("/register", authRateLimiter);
router.use("/me", authMiddleware);
// router.use("/refresh");

router.use(
  createProxyMiddleware({
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
  }),
);

export default router;
