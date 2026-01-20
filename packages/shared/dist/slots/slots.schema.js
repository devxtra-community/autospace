"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSlotSchema = void 0;
const zod_1 = require("zod");
exports.CreateSlotSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Invalid startTime format (HH:MM)"),
    endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Invalid endTime format (HH:MM)"),
    price: zod_1.z.number().positive("Price must be greater than 0"),
});
