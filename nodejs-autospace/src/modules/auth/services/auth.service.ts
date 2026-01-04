// Placeholder for auth service layer
// Business logic will be implemented later
export {};

import { AuthRequest } from "../../../types/auth.type";
import { Response } from "express";

// test route of protected router //

export const protectedRoute = (req: AuthRequest, res: Response): void => {
  res.json({
    success: true,
    message: "Authenticated successfully",
    user: req.user,
  });
};
