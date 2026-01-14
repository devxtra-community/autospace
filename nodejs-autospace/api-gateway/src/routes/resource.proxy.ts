import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";

const router = Router();

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

router.use(
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => `/companies${path}`,
  }),
);

export default router;
