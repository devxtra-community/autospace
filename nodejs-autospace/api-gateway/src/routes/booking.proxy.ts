import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";
import type { Request } from "express";
import type { ClientRequest } from "http";

const router = Router();

const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL || "http://localhost:4002";

const attachUserHeaders = (proxyReq: ClientRequest, req: Request) => {
  if (req.user) {
    proxyReq.setHeader("x-user-id", req.user.id);
    proxyReq.setHeader("x-user-role", req.user.role);
    proxyReq.setHeader("x-user-email", req.user.email);
  }

  if (req.headers.authorization) {
    proxyReq.setHeader("authorization", req.headers.authorization);
  }
};

router.use(
  "/bookings",
  authMiddleware,
  rbac(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER, UserRole.VALET),
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => `/bookings${path}`,

    on: {
      proxyReq: (proxyReq: ClientRequest, req: Request) => {
        attachUserHeaders(proxyReq, req);

        if (
          req.body &&
          Object.keys(req.body).length > 0 &&
          ["POST", "PUT", "PATCH"].includes(req.method)
        ) {
          const bodyData = JSON.stringify(req.body);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

          proxyReq.write(bodyData);
        }
      },
    },
  }),
);

export default router;
