import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";
import type { Request } from "express";
import type { ClientRequest } from "http";

const router = Router();
const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

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
  "/companies",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/companies${path}`,

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

router.use(
  "/public/garages",
  (req, _res, next) => {
    console.log(" GATEWAY URL:", req.originalUrl);
    console.log("🌐 GATEWAY PATH:", req.url);
    next();
  },
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    router: () => `${RESOURCE_SERVICE_URL}/garages`,
  }),
);

router.use(
  "/garages",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/garages${path}`,
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

// slots routes
router.use(
  "/slots",
  authMiddleware,
  rbac(UserRole.MANAGER),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/slots${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        attachUserHeaders(proxyReq, req);
      },
    },
  }),
);

// valet routes
router.use(
  "/valet",
  authMiddleware,
  rbac(UserRole.MANAGER, UserRole.VALET),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/valet${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        attachUserHeaders(proxyReq, req);
      },
    },
  }),
);

router.use(
  "/files/upload",
  authMiddleware,
  rbac(UserRole.OWNER),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: () => "/files/upload",
    on: {
      proxyReq: (proxyReq, req) => {
        attachUserHeaders(proxyReq, req);
      },
    },
  }),
);

router.use(
  "/files",
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/files${path}`,
  }),
);

export default router;
