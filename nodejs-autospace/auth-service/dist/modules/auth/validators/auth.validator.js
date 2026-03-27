"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProfile = exports.validateLogin = exports.validateRegister = void 0;
const auth_api_schema_1 = require("./auth.api.schema");
const shared_1 = require("@autospace/shared");
const validateRegister = (req, res, next) => {
    const parsed = auth_api_schema_1.RegisterApiSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.flatten(),
        });
    }
    req.body = parsed.data;
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const parsed = auth_api_schema_1.LoginApiSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.flatten(),
        });
    }
    req.body = parsed.data;
    next();
};
exports.validateLogin = validateLogin;
const validateUpdateProfile = (req, res, next) => {
    const result = shared_1.UpdateProfileSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            errors: result.error.issues,
        });
    }
    req.body = result.data;
    next();
};
exports.validateUpdateProfile = validateUpdateProfile;
