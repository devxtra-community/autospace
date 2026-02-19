// validators/valet.validator.ts

import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// For approve/reject (no body needed, just params)
export const ValetIdParamSchema = z.object({
  id: z.string().uuid("Invalid valet ID"),
});

// For getting valets by garage
export const GetValetsByGarageSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type GetValetsByGarageQuery = z.infer<typeof GetValetsByGarageSchema>;

// Middleware validators
export const validateValetIdParam = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = ValetIdParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid valet ID",
      errors: result.error.issues,
    });
  }

  next();
};

export const validateGetValetsByGarage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = GetValetsByGarageSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: result.error.issues,
    });
  }

  Object.assign(req.query, result.data);
  next();
};
