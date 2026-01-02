import { Response } from "express";
import { AuthErrorCode } from "../constants/auth.error";

export const sendAuthError = (
  res: Response,
  code: AuthErrorCode,
  message: string,
  statusCode: number = 401,
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
