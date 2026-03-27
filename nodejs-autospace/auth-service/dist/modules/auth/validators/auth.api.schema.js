"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerRegisterSchema = exports.LoginApiSchema = exports.RegisterApiSchema = void 0;
const zod_1 = require("zod");
const shared_1 = require("@autospace/shared");
exports.RegisterApiSchema = shared_1.BaseRegisterSchema.extend({
    role: zod_1.z.enum(["admin", "owner", "manager", "valet", "customer"]),
});
exports.LoginApiSchema = zod_1.z.object({
    email: shared_1.EmailSchema,
    password: zod_1.z.string().min(1),
});
exports.OwnerRegisterSchema = shared_1.BaseRegisterSchema.superRefine((data, ctx) => {
    if (data.password != data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            message: "Passwords do not match",
            code: zod_1.ZodIssueCode.custom,
        });
    }
});
