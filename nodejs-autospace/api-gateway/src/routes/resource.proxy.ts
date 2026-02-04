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

router.use(
  "/companies",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/companies${path}`,

    //  move onProxyReq under "on"
    on: {
      proxyReq: (proxyReq: ClientRequest, req: Request) => {
        if (req.body) {
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
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: () => "/garages",
  }),
);

router.use("/garages", (req, _res, next) => {
  console.log("GATEWAY BODY:", req.body);
  next();
});

// garage routes
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
        if (!req.body || !Object.keys(req.body).length) return;

        const bodyData = JSON.stringify(req.body);

        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

        proxyReq.write(bodyData);
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
