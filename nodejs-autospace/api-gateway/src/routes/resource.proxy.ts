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
  "/public",
  (req, _res, next) => {
    console.log(" GATEWAY URL:", req.originalUrl);
    console.log(" GATEWAY PATH:", req.url);
    next();
  },
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/public${path}`,
  }),
);

router.use(
  "/garages",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER),
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
  "/valets",
  authMiddleware,
  rbac(UserRole.MANAGER, UserRole.VALET, UserRole.CUSTOMER),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path, req) => {
      const original = req.originalUrl;

      console.log("REWRITE ORIGINAL:", original);

      // internal routes (used by booking-service / auth-service)
      if (
        original.includes("/assign") ||
        original.includes("/release") ||
        original.includes("/available") ||
        original.includes("/register")
      ) {
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
  "/files",
  authMiddleware,
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/files${path}`,
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
