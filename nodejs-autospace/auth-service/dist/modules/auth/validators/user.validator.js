"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserStatusSchema = exports.validateGetAllUsersQuery = exports.GetAllUsersQuerySchema = void 0;
// validators/user.validator.ts
const zod_1 = require("zod");
exports.GetAllUsersQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]).optional(),
    role: zod_1.z.enum(["ADMIN", "OWNER", "MANAGER", "VALET", "CUSTOMER"]).optional(),
    search: zod_1.z.string().min(2).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
});
const validateGetAllUsersQuery = (req, res, next) => {
    const parsed = exports.GetAllUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid query parameters",
            errors: parsed.error.issues,
        });
    }
    res.locals.query = parsed.data;
    next();
};
exports.validateGetAllUsersQuery = validateGetAllUsersQuery;
exports.UpdateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]),
    reason: zod_1.z.string().min(10).optional(),
});
