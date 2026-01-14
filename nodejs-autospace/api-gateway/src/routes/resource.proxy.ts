import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

router.use(
  authMiddleware,
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/": "/companies",
    },
  }),
);

export default router;
