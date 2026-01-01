import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;
  logError(err, "global-error-handler");

  res.status(500).json({ message: "Internal server error" });
};
