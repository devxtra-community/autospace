import { z } from "zod";
import { BaseRegisterSchema, LoginSchema } from "../../../schemas/auth.schema";

export const RegisterApiSchema = BaseRegisterSchema.extend({
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
});

export const LoginApiSchema = LoginSchema;

export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
export type LoginApiInput = z.infer<typeof LoginApiSchema>;
