import { Request, Response, NextFunction } from "express";
import { CreateGarageSchema } from "@autospace/shared";

export const validateCreateGarage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("RAW BODY:", req.body);
  console.log("SCHEMA SHAPE:", CreateGarageSchema.shape);

  const result = CreateGarageSchema.safeParse(req.body);

  console.log("VALIDATION RESULT:", JSON.stringify(result, null, 2));

  if (!result.success) {
    console.log("VALIDATION ERRORS:", result.error.format());
    return res.status(400).json({ errors: result.error.format() });
  }

  console.log("PARSED BODY:", result.data);
  req.body = result.data;
  next();
};
