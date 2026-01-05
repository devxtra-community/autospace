import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.type";
import { verifyAccessToken } from "../utils/jwt.util";
import { sendAuthError } from "../utils/error";
import { AuthErrorCode } from "../modules/auth/constants/auth.error";

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user identity to request
 */
// console.log("ACCESS SECRET (verify):", process.env.JWT_ACCESS_SECRET);

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    //  Authorization header must exist
    if (!authHeader) {
      sendAuthError(
        res,
        AuthErrorCode.AUTH_REQUIRED,
        "Authorization header missing",
        401,
      );
      return;
    }

    //  Must follow Bearer <token> format
    if (!authHeader.startsWith("Bearer ")) {
      sendAuthError(
        res,
        AuthErrorCode.TOKEN_INVALID,
        "Invalid authorization format. Use Bearer <token>",
        401,
      );
      return;
    }

    //  Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      sendAuthError(
        res,
        AuthErrorCode.TOKEN_INVALID,
        "Access token missing",
        401,
      );
      return;
    }

    //  Verify token (throws if invalid or expired)
    const decoded = verifyAccessToken(token);

    //  Attach authenticated user to request
    req.user = decoded;

    //  Continue to next middleware / controller
    next();
  } catch {
    sendAuthError(
      res,
      AuthErrorCode.TOKEN_INVALID,
      "Invalid or expired token",
      401,
    );
    return;
  }
};
