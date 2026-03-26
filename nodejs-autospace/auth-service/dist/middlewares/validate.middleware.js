"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const auth_error_1 = require("../modules/auth/constants/auth.error");
const validate = (schema) => async (req, res, next) => {
    const result = await schema.safeParseAsync(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        return res.status(400).json({
            success: false,
            error: {
                code: auth_error_1.AuthErrorCode.VALIDATION_FAILED,
                message: "Validation failed",
            },
            errors,
        });
    }
    req.body = result.data;
    next();
};
exports.validate = validate;
