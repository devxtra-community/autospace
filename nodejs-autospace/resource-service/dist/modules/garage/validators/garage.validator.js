"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateSlot = exports.validateCreateFloor = exports.validatePublicGarageQuery = exports.PublicGarageQuerySchema = exports.validateCreateGarage = void 0;
const shared_1 = require("@autospace/shared");
const shared_2 = require("@autospace/shared");
const zod_1 = require("zod");
const validateCreateGarage = (req, res, next) => {
    const result = shared_1.CreateGarageSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    req.body = result.data;
    next();
};
exports.validateCreateGarage = validateCreateGarage;
exports.PublicGarageQuerySchema = zod_1.z
    .object({
    lat: zod_1.z.coerce.number().min(-90).max(90).optional(),
    lng: zod_1.z.coerce.number().min(-180).max(180).optional(),
    radius: zod_1.z.coerce.number().min(1).max(100).optional().default(20),
    valetAvailable: zod_1.z
        .enum(["true", "false"])
        .optional()
        .transform((val) => {
        if (val === undefined)
            return undefined;
        return val === "true";
    }),
    page: zod_1.z.coerce.number().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).optional().default(10),
})
    .refine((data) => {
    // Both lat and lng must be provided together, or neither
    if (data.lat !== undefined && data.lng === undefined)
        return false;
    if (data.lng !== undefined && data.lat === undefined)
        return false;
    return true;
}, {
    message: "Both latitude and longitude must be provided together",
});
// Middleware validator
const validatePublicGarageQuery = (req, res, next) => {
    const result = exports.PublicGarageQuerySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid query parameters",
            errors: result.error.issues,
        });
    }
    // Attach validated data to req for controller to use
    // req.query = result.data as any;
    req.validateQuery = result.data;
    next();
};
exports.validatePublicGarageQuery = validatePublicGarageQuery;
const validateCreateFloor = (req, res, next) => {
    const result = shared_2.CreateFloorSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid floor data",
            errors: result.error.format(),
        });
    }
    req.body = result.data;
    next();
};
exports.validateCreateFloor = validateCreateFloor;
const validateCreateSlot = (req, res, next) => {
    const result = shared_1.CreateSlotSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid slot data",
            errors: result.error.format(),
        });
    }
    req.body = result.data;
    next();
};
exports.validateCreateSlot = validateCreateSlot;
