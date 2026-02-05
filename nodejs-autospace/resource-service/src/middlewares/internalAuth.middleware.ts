// resource/middlewares/internal-auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { UserRole, UserStatus } from "../types/auth.type";

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

  req.user = {
    id: userId,
    role,
    email: email ?? "",
    status: UserStatus.ACTIVE,
  };

  next();
};
