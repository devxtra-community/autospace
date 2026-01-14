"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterApiSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("./../../shared/auth/schemas/auth.schema");
exports.RegisterApiSchema = auth_schema_1.BaseRegisterSchema.extend({
    role: zod_1.z.enum(["admin", "owner", "manager", "valet", "customer"]),
});
