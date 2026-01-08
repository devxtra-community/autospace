import { z } from "zod";
import { BaseRegisterSchema, EmailSchema } from "@autospace/shared";

export const RegisterApiSchema = BaseRegisterSchema.extend({
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
});

export const LoginApiSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1),
});

export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
export type LoginApiInput = z.infer<typeof LoginApiSchema>;
