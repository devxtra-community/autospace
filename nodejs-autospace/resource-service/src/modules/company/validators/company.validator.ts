import { Request, Response, NextFunction } from "express";
import { CreateCompanySchema } from "@autospace/shared";

export const validateCreateCompany = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateCompanySchema.safeParse(req.body);

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
