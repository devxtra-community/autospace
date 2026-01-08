import { z } from "zod";
import { BaseRegisterSchema } from "./../../shared/auth/schemas/auth.schema";

export const RegisterApiSchema = BaseRegisterSchema.extend({
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
});

export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
