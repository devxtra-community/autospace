import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";

const router = Router();

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

// company routes
router.use(
  "/companies",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/companies${path}`,
    on: {
      proxyReq: (proxyReq, req: unknown) => {
        if (
          typeof req === "object" &&
          req !== null &&
          "body" in req &&
          typeof (req as { body?: unknown }).body === "object" &&
          (req as { body: Record<string, unknown> }).body !== null &&
          Object.keys((req as { body: Record<string, unknown> }).body).length >
            0
        ) {
          const body = (req as { body: Record<string, unknown> }).body;
          const bodyData = JSON.stringify(body);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    },
  }),
);

// garage routes
router.use(
  "/garages",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/garages${path}`,
  }),
);

export default router;
