// resource/middlewares/internal-auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { UserRole, UserStatus } from "../types/auth.type";
import { requireActiveGarage } from "./garage-status.middleware";

export const internalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  const role = req.headers["x-user-role"] as UserRole | undefined;
  const email = req.headers["x-user-email"] as string | undefined;

  if (!userId || !role) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Missing gateway identity",
    });
  }

  // Validate internal service token if provided
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (
    process.env.INTERNAL_SERVICE_TOKEN &&
    token !== process.env.INTERNAL_SERVICE_TOKEN
  ) {
    console.warn(`Internal token mismatch for user ${userId}`);
    // For now, only log warn or enforce? Let's enforce for security.
    return res.status(403).json({
      success: false,
      message: "Forbidden - Invalid internal service token",
    });
  }

  req.user = {
    id: userId,
    role,
    email: email ?? "",
    status: UserStatus.ACTIVE,
  };

  requireActiveGarage(req, res, next);
};
