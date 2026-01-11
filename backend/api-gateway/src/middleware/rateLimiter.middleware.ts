import rateLimit from "express-rate-limit";
import { Response, Request } from "express";
import { sendAuthError } from "../utils/error";
import { AuthErrorCode } from "../utils/error";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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

// add limiting as per project moves like password reset limit //
