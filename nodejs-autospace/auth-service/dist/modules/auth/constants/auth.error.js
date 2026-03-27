"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrorCode = void 0;
var AuthErrorCode;
(function (AuthErrorCode) {
    AuthErrorCode["INVALID_CREDENTIALS"] = "AUTH_INVALID_CREDENTIALS";
    AuthErrorCode["USER_NOT_FOUND"] = "AUTH_USER_NOT_FOUND";
    AuthErrorCode["USER_NOT_APPROVED"] = "AUTH_USER_NOT_APPROVED";
    AuthErrorCode["TOKEN_EXPIRED"] = "AUTH_TOKEN_EXPIRED";
    AuthErrorCode["TOKEN_INVALID"] = "AUTH_TOKEN_INVALID";
    AuthErrorCode["AUTH_REQUIRED"] = "AUTH_REQUIRED";
    // UNAUTHORIZED = "AUTH_UNAUTHORIZED",
    AuthErrorCode["FORBIDDEN"] = "AUTH_FORBIDDEN";
    AuthErrorCode["VALIDATION_FAILED"] = "AUTH_VALIDATION_FAILED";
    AuthErrorCode["RATE_LIMITED"] = "AUTH_RATE_LIMITED";
})(AuthErrorCode || (exports.AuthErrorCode = AuthErrorCode = {}));
