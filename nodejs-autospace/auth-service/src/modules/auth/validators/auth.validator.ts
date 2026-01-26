import { Request, Response, NextFunction } from "express";
import { RegisterApiSchema, LoginApiSchema } from "./auth.api.schema";
import { UpdateProfileSchema } from "@autospace/shared";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = RegisterApiSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  req.body = parsed.data;
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = LoginApiSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  req.body = parsed.data;
  next();
};

export const validateUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = UpdateProfileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues,
    });
  }

  req.body = result.data;
  next();
};
