import { z } from "zod";
import { BaseRegisterSchema } from "./schemas/auth.schema";

export const RegisterApiSchema = BaseRegisterSchema.extend({
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
