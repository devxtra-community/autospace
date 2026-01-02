import rateLimit from "express-rate-limit";
import { Response, Request } from "express";
import { sendAuthError } from "../utils/error";
import { AuthErrorCode } from "../constants/auth.error";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req: Request, res: Response) => {
    return sendAuthError(
      res,
      AuthErrorCode.RATE_LIMITED,
      "Too many authentication requests , please try again later.",
      429,
    );
  },
});

// add limiting asper project moves like password reset limit //
