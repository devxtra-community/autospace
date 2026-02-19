import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next; // to avoid unused variable error
  logger.error("Unhandled Error", err);

  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
  });
};
