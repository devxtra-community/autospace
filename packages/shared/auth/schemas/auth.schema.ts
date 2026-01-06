import { z } from "zod";
// import { EmailSchema, PhoneSchema, PasswordSchema } from "./common.schema"

const EmailSchema = z.string().email("Invalid email format").min(5).max(255);

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must contain uppercase, lowercase, number, and special character",
  );

const PhoneSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{1,14}$/,
    "Phone number must be in international format (e.g. +919876543210)",
  );

export const BaseRegisterSchema = z.object({
  fullname: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s]+$/),
  email: EmailSchema,
  phone: PhoneSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
});

export const UserRegisterSchema = BaseRegisterSchema.extend({
  country: z
    .string()
    .min(2, "Country name must be at least 2 characters")
    .max(56, "Country name too long")
    .regex(/^[a-zA-Z\s]+$/, "Country can only contain letters and spaces"),

  state: z
    .string()
    .min(2, "State name must be at least 2 characters")
    .max(100, "State name too long")
    .regex(/^[a-zA-Z\s]+$/, "State can only contain letters and spaces"),

  homeAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address too long")
    .regex(
      /^[a-zA-Z0-9\s,.-]+$/,
      "Address can contain letters, numbers, commas, dots, and hyphens",
    ),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const ValetRegisterSchema = BaseRegisterSchema.extend({
  garageId: z.coerce.number(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const ManagerRegisterSchema = BaseRegisterSchema.extend({
  accessCode: z.coerce.number(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const CompanyRegisterSchema = BaseRegisterSchema.extend({
  companyName: z.string().min(2).max(150),

  bussinessNumber: z.coerce.number(),

  location: z.string().min(2).max(200),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;
export type ManagerRegisterDto = z.infer<typeof ManagerRegisterSchema>;
export type ValetRegisterDto = z.infer<typeof ValetRegisterSchema>;
export type CompanyRegisterDto = z.infer<typeof CompanyRegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
