"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCompany = void 0;
const shared_1 = require("@autospace/shared");
const validateCreateCompany = (req, res, next) => {
    const result = shared_1.CreateCompanySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues,
        });
    }
    req.body = result.data;
    next();
};
exports.validateCreateCompany = validateCreateCompany;
