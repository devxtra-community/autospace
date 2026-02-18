"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSlotSchema = exports.CreateFloorSchema = exports.CreateGarageSchema = void 0;
const zod_1 = require("zod");
exports.CreateGarageSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    locationName: zod_1.z.string().min(3),
    latitude: zod_1.z.coerce.number().min(-90).max(90),
    longitude: zod_1.z.coerce.number().min(-180).max(180),
    capacity: zod_1.z.number().int().positive(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
        .optional(),
});
exports.CreateFloorSchema = zod_1.z.object({
    floorNumber: zod_1.z.number().int().nonnegative(),
});
exports.CreateSlotSchema = zod_1.z.object({
    floorNumber: zod_1.z.number().int().nonnegative(),
    // Only A1–A5, B1–B5, etc.
    slotNumber: zod_1.z
        .string()
        .regex(/^[A-Z][1-5]$/, "Slot must be A1–A5, B1–B5, etc."),
    slotSize: zod_1.z.enum(["STANDARD", "LARGE"]),
});
