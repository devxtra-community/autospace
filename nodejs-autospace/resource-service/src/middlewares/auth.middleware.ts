import { Request, Response, NextFunction } from "express";
import { extractAndVerify } from "../utils/jwt.utils";

export const authTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const user = extractAndVerify(authHeader);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// For  when there route for not required authentication

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const user = extractAndVerify(authHeader);
      req.user = user;
    }

    next();
  } catch (error) {
    console.log(error);

    next();
  }
};
