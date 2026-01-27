// validators/user.validator.ts
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const GetAllUsersQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]).optional(),
  role: z.enum(["ADMIN", "OWNER", "MANAGER", "VALET", "CUSTOMER"]).optional(),
  search: z.string().min(2).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type GetAllUsersQuery = z.infer<typeof GetAllUsersQuerySchema>;

export const validateGetAllUsersQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = GetAllUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: parsed.error.issues,
    });
  }

  res.locals.query = parsed.data;

  next();
};

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]),
  reason: z.string().min(10).optional(),
});

export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
