import { Request, Response, NextFunction } from "express";
import { CreateGarageSchema } from "@autospace/shared";

export const validateCreateGarage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateGarageSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;

  next();
};
