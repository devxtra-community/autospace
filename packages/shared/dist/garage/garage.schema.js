"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGarageSchema = void 0;
const zod_1 = require("zod");
exports.CreateGarageSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    locationName: zod_1.z.string().min(3),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    capacity: zod_1.z.number().int().positive(),
});
