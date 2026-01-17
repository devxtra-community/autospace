import { Request, Response, NextFunction } from "express";
import { ManagerRegisterSchema } from "@autospace/shared";

export const validateManagerRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = ManagerRegisterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues,
    });
  }

  const { confirmPassword, ...cleanData } = result.data;

  req.body = cleanData;
  next();
};
