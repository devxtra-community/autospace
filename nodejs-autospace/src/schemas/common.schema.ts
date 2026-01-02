import { z } from "zod";

export const EmailSchema = z
  .string()
  .email("Invalid email format")
  .min(5)
  .max(255);

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must contain uppercase, lowercase, number, and special character",
  );

export const PhoneSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{1,14}$/,
    "Phone number must be in international format (e.g. +919876543210)",
  );
