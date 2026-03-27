"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateManagerRegister = void 0;
const shared_1 = require("@autospace/shared");
const validateManagerRegister = (req, res, next) => {
    const result = shared_1.ManagerRegisterSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.issues,
        });
    }
    const { confirmPassword, ...cleanData } = result.data;
    req.body = cleanData;
    next();
};
exports.validateManagerRegister = validateManagerRegister;
