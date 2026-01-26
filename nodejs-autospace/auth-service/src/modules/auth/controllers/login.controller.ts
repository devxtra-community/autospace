import { Request, Response } from "express";
import { loginUser } from "../services/login.service";
import { env } from "../../../config/env.config";

export const login = async (req: Request, res: Response) => {
  try {
    const { user, tokens } = await loginUser(req.body);

    console.log("RAW BODY:", env.COOKIE_SAMESITE, env.COOKIE_SECURE);

    const cookieOptions = {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
    };

    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error: unknown) {
    console.error("Login API error", error);

    if (error instanceof Error) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      if (error.message === "User not approved") {
        return res.status(403).json({
          success: false,
          error: {
            code: "USER_NOT_APPROVED",
            message: "Your account is pending approval",
          },
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      },
    });
  }
};
