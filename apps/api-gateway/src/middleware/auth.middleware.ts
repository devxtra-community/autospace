// api-gateway/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { sendAuthError } from "../utils/error";
import { AuthErrorCode } from "../utils/error";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      sendAuthError(
        res,
        AuthErrorCode.AUTH_REQUIRED,
        "Authorization header missing",
        401,
      );
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      sendAuthError(
        res,
        AuthErrorCode.TOKEN_INVALID,
        "Invalid authorization format. Use Bearer <token>",
        401,
      );
      return;
    }

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

    //  Verify token and attach to request
    const decoded = verifyAccessToken(token);

    // Attach full payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };

    next();
  } catch (error: any) {
    const isExpired = error.name === "TokenExpiredError";
    sendAuthError(
      res,
      isExpired ? AuthErrorCode.TOKEN_EXPIRED : AuthErrorCode.TOKEN_INVALID,
      isExpired ? "Token has expired" : "Invalid or expired token",
      401,
    );
    return;
  }
};
