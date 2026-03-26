"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAuthError = void 0;
const sendAuthError = (res, code, message, statusCode = 401) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
    });
};
exports.sendAuthError = sendAuthError;
