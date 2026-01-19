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
    // console.log("Cookies in gateway:", req.cookies);

    const tokenFromCookie = req.cookies?.accessToken;

    const authHeader = req.headers.authorization;

    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = tokenFromCookie || tokenFromHeader;
    // console.log("Access token used:", token);

    if (!token) {
      sendAuthError(
        res,
        AuthErrorCode.TOKEN_INVALID,
        "Access token missing",
        401,
      );
      return;
    }

    // Verify token and attach to request
    const decoded = verifyAccessToken(token);

    // Attach full payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };

    req.headers["x-user-id"] = decoded.id;
    console.log("AUTH USER:", req.user);
    next();
  } catch (error: unknown) {
    let isExpired = false;

    if (error instanceof Error) {
      isExpired = error.name === "TokenExpiredError";
    }

    sendAuthError(
      res,
      isExpired ? AuthErrorCode.TOKEN_EXPIRED : AuthErrorCode.TOKEN_INVALID,
      isExpired ? "Token has expired" : "Invalid or expired token",
      401,
    );
    return;
  }
};
