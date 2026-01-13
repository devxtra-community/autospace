import { z, ZodIssueCode } from "zod";
import { BaseRegisterSchema, EmailSchema } from "@autospace/shared";

export const RegisterApiSchema = BaseRegisterSchema.extend({
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
});

export const LoginApiSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1),
});

export const OwnerRegisterSchema = BaseRegisterSchema.superRefine(
  (data, ctx) => {
    if (data.password != data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Passwords do not match",
        code: ZodIssueCode.custom,
      });
    }
  },
);
export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
export type LoginApiInput = z.infer<typeof LoginApiSchema>;
export type OwnerRegisterDto = z.infer<typeof OwnerRegisterSchema>;
