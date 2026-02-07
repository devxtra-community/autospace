import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const errorHandler = (err: unknown, req: Request, res: Response) => {
  logger.error("Unhandled Error", err);
  res.status(500).json({ message: "Internal Server Error" });
};
