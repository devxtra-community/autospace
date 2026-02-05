import { Request, Response, NextFunction } from "express";
import { CreateGarageSchema, CreateSlotSchema } from "@autospace/shared";
import { CreateFloorSchema } from "@autospace/shared";
import { z } from "zod";

export const validateCreateGarage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateGarageSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  req.body = result.data;
  next();
};

export const PublicGarageQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().min(1).max(100).optional().default(20),
    valetAvailable: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => val === "true"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
  })
  .refine(
    (data) => {
      // Both lat and lng must be provided together, or neither
      if (data.lat !== undefined && data.lng === undefined) return false;
      if (data.lng !== undefined && data.lat === undefined) return false;
      return true;
    },
    {
      message: "Both latitude and longitude must be provided together",
    },
  );

export type PublicGarageQuery = z.infer<typeof PublicGarageQuerySchema>;

// Middleware validator
export const validatePublicGarageQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = PublicGarageQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: result.error.issues,
    });
  }

  // Attach validated data to req for controller to use
  // req.query = result.data as any;
  req.validateQuery = result.data;

  next();
};

export const validateCreateFloor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateFloorSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid floor data",
      errors: result.error.format(),
    });
  }

  req.body = result.data;
  next();
};

export const validateCreateSlot = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CreateSlotSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid slot data",
      errors: result.error.format(),
    });
  }

  req.body = result.data;
  next();
};
