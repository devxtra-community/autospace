import type { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../types/auth.type.js";
import { requireActiveGarage } from "./garage-status.middleware.js";

export const internalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  //   Allow INTERNAL service calls
  if (
    authHeader &&
    authHeader === `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
  ) {
    return next();
  }

  const userId = req.headers["x-user-id"] as string | undefined;
  const role = req.headers["x-user-role"] as UserRole | undefined;
  const email = req.headers["x-user-email"] as string | undefined;

  if (!userId || !role) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Missing gateway identity",
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
