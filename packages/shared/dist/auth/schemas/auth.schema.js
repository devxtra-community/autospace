"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.CompanyRegisterSchema = exports.ManagerRegisterSchema = exports.ValetRegisterSchema = exports.UserRegisterSchema = exports.BaseRegisterSchema = exports.PhoneSchema = exports.PasswordSchema = exports.EmailSchema = void 0;
const zod_1 = require("zod");
// import { EmailSchema, PhoneSchema, PasswordSchema } from "./common.schema"
exports.EmailSchema = zod_1.z
    .string()
    .email("Invalid email format")
    .min(5)
    .max(255);
exports.PasswordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain uppercase, lowercase, number, and special character");
exports.PhoneSchema = zod_1.z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in international format (e.g. +919876543210)");
exports.BaseRegisterSchema = zod_1.z.object({
    fullname: zod_1.z
        .string()
        .min(2)
        .max(100)
        .regex(/^[a-zA-Z\s]+$/),
    email: exports.EmailSchema,
    phone: exports.PhoneSchema,
    password: exports.PasswordSchema,
    confirmPassword: zod_1.z.string(),
});
exports.UserRegisterSchema = exports.BaseRegisterSchema.extend({
    country: zod_1.z
        .string()
        .min(2, "Country name must be at least 2 characters")
        .max(56, "Country name too long")
        .regex(/^[a-zA-Z\s]+$/, "Country can only contain letters and spaces"),
    state: zod_1.z
        .string()
        .min(2, "State name must be at least 2 characters")
        .max(100, "State name too long")
        .regex(/^[a-zA-Z\s]+$/, "State can only contain letters and spaces"),
    homeAddress: zod_1.z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address too long")
        .regex(/^[a-zA-Z0-9\s,.-]+$/, "Address can contain letters, numbers, commas, dots, and hyphens"),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            message: "Passwords do not match",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.ValetRegisterSchema = exports.BaseRegisterSchema.extend({
    garageId: zod_1.z.coerce.number(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            message: "Passwords do not match",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.ManagerRegisterSchema = exports.BaseRegisterSchema.extend({
    accessCode: zod_1.z.coerce.number(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            message: "Passwords do not match",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.CompanyRegisterSchema = exports.BaseRegisterSchema.extend({
    companyName: zod_1.z.string().min(2).max(150),
    bussinessNumber: zod_1.z.coerce.number(),
    location: zod_1.z.string().min(2).max(200),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            message: "Passwords do not match",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
