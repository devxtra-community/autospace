import { Response } from "express";

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  USER_NOT_APPROVED = "AUTH_USER_NOT_APPROVED",
  TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  TOKEN_INVALID = "AUTH_TOKEN_INVALID",
  AUTH_REQUIRED = "AUTH_REQUIRED",
  // UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  FORBIDDEN = "AUTH_FORBIDDEN",
  VALIDATION_FAILED = "AUTH_VALIDATION_FAILED",
  RATE_LIMITED = "AUTH_RATE_LIMITED",
}

export const sendAuthError = (
  res: Response,
  code: AuthErrorCode,
  message: string,
  statusCode: number = 401,
) => {
  return res.status(statusCode).json({
    success: false,
    code: code,
    message: message,
  });
};
