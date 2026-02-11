import { Router, Request, Response, RequestHandler } from "express";
import axios from "axios";
import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter.middleware";
import { rbac } from "../middleware/rbac.middleware";
import { UserRole } from "../constants/role.enum";

const router = Router();

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001";

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

const createAuthProxy = (targetPath: string) => {
  return async (req: Request, res: Response) => {
    try {
      const url = `${AUTH_SERVICE_URL}${targetPath}`;

      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.cookie || "",

          ...(req.user && {
            "x-user-id": req.user.id,
            "x-user-role": req.user.role,
            "x-user-email": req.user.email,
          }),
        },

        timeout: 10000,
        validateStatus: () => true,
      });

      if (response.headers["set-cookie"]) {
        res.setHeader("Set-Cookie", response.headers["set-cookie"]);
      }

      res.status(response.status).json(response.data);
    } catch (error: unknown) {
      console.error("Auth proxy error:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          return res.status(504).json({
            success: false,
            message: "Auth service timeout",
          });
        }

        if (error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
      }

      res.status(500).json({
        success: false,
        message: "Gateway error",
      });
    }
  };
};

router.post(
  "/login",
  authRateLimiter as unknown as RequestHandler,
  createAuthProxy("/api/login"),
);
router.post(
  "/register",
  authRateLimiter as unknown as RequestHandler,
  createAuthProxy("/api/register"),
);
router.post(
  "/logout",
  authRateLimiter as unknown as RequestHandler,
  createAuthProxy("/api/logout"),
);
router.post("/refresh", createAuthProxy("/api/refresh"));
router.post("/owner/register", createAuthProxy("/api/owner/register"));
router.post("/manager/register", createAuthProxy("/api/manager/register"));
router.post("/valet/register", createAuthProxy("/api/valet/register"));

router.get(
  "/admin/allusers",
  authMiddleware,
  rbac(UserRole.ADMIN),
  createAuthProxy("/api/admin/allusers"),
);

router.get("/profile/my", authMiddleware, createAuthProxy("/api/profile/my"));
router.patch("/profile/my", authMiddleware, createAuthProxy("/api/profile/my"));
router.use("/manager", authMiddleware, async (req: Request, res: Response) => {
  try {
    const targetUrl =
      AUTH_SERVICE_URL + req.originalUrl.replace("/api/auth", "/api");

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        ...(req.user && {
          "x-user-id": req.user.id,
          "x-user-role": req.user.role,
          "x-user-email": req.user.email,
        }),
      },
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Manager proxy error:", err);
    return res.status(500).json({
      success: false,
      message: "Gateway manager proxy error",
    });
  }
});
export default router;
