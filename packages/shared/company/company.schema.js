"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCompanySchema = void 0;
const zod_1 = require("zod");
exports.CreateCompanySchema = zod_1.z.object({
  companyName: zod_1.z.string().min(2).max(150),
  businessRegistrationNumber: zod_1.z.string().min(3).max(100),
  businessLocation: zod_1.z.string().min(2).max(200),
  contactEmail: zod_1.z.string().email(),
  contactPhone: zod_1.z.string().min(7).max(20),
});
