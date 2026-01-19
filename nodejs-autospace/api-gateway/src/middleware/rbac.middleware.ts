import { Request, Response, NextFunction } from "express";
import { UserRole } from "../constants/role.enum";

export const rbac =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("RBAC CHECK:", {
      user: req.user,
      allowedRoles,
    });

    const user = req.user; // set by auth middleware

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient Permissions" });
    }
    next();
  };
