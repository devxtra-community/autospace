import { Router, Request, Response } from "express";
import axios from "axios";
import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";

const router = Router();

const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4003";

// Parse JSON for this router
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Manual proxy middleware with proper typing
const proxyToResource = async (req: Request, res: Response) => {
  try {
    const path = req.path === "/" ? "" : req.path;
    const baseRoute = req.baseUrl.replace("/api", "");
    const url = `${RESOURCE_SERVICE_URL}${baseRoute}${path}`;

    console.log("=== RESOURCE PROXY ===");
    console.log("Target URL:", url);
    console.log("Method:", req.method);
    console.log("Body:", req.body);

    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.headers["x-user-id"] as string,
        "x-user-role": req.headers["x-user-role"] as string,
        authorization: req.headers["authorization"] as string,
      },
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error: unknown) {
    console.error("Resource proxy error:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return res.status(504).json({
          success: false,
          message: "Resource service timeout",
        });
      }

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
    }

    res.status(500).json({
      success: false,
      message: "Gateway proxy error",
    });
  }
};

// Company routes
router.all(
  "/companies/*",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  proxyToResource,
);

router.all(
  "/companies",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  proxyToResource,
);

// Garage routes
router.all(
  "/garages/*",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  proxyToResource,
);

router.all(
  "/garages",
  authMiddleware,
  rbac(UserRole.OWNER, UserRole.ADMIN),
  proxyToResource,
);

export default router;
