"use strict";
// validators/valet.validator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetValetsByGarage = exports.validateValetIdParam = exports.GetValetsByGarageSchema = exports.ValetIdParamSchema = void 0;
const zod_1 = require("zod");
// For approve/reject (no body needed, just params)
exports.ValetIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid valet ID"),
});
// For getting valets by garage
exports.GetValetsByGarageSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
    page: zod_1.z.coerce.number().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).optional().default(10),
});
// Middleware validators
const validateValetIdParam = (req, res, next) => {
    const result = exports.ValetIdParamSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid valet ID",
            errors: result.error.issues,
        });
    }
    next();
};
exports.validateValetIdParam = validateValetIdParam;
const validateGetValetsByGarage = (req, res, next) => {
    const result = exports.GetValetsByGarageSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid query parameters",
            errors: result.error.issues,
        });
    }
    Object.assign(req.query, result.data);
    next();
};
exports.validateGetValetsByGarage = validateGetValetsByGarage;
