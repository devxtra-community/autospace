import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";

const router = Router();

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

router.use("/companies", (req, _, next) => {
  console.log("Companies route hit:", req.method, req.originalUrl);
  next();
});

console.log("RESOURCE_SERVICE_URL =", process.env.RESOURCE_SERVICE_URL);

// company routes
router.use(
  "/companies",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => `/companies${path}`,
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

// garage routes
router.use(
  "/garages",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER),
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/garages${path}`,
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

export default router;
