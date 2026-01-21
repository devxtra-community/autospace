import { Request, Response, NextFunction } from "express";
import { CreateSlotSchema } from "@autospace/shared";

export const validateCreateSlot = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateSlotSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid slot input",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};
