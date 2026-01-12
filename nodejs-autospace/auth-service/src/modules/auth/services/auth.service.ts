// Placeholder for auth service layer
// Business logic will be implemented later
export {};

import { Response, Request } from "express";

// test route of protected router //

export const protectedRoute = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Authenticated successfully",
    user: req.user,
  });
};
