import { Request, Response } from "express";
import { loginUser } from "../services/login.service";
import { env } from "../../../config/env.config";

export const login = async (req: Request, res: Response) => {
  try {
    //  Service handles validation, token creation & DB
    const { user, tokens } = await loginUser(req.body);

    console.log("RAW BODY:", req.body);

    //  Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    //  Return ONLY access token in body
    return res.status(200).json({
      success: true,
      message: "Login successful",
      // data: {
      //   accessToken: tokens.accessToken,
      // },
      user,
    });
  } catch (error: unknown) {
    console.error("Login API error", error);

    if (error instanceof Error) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (error.message === "User not approved") {
        return res.status(403).json({ message: "User not approved" });
      }
    }

    return res.status(500).json({
      message: "Login failed",
    });
  }
};
