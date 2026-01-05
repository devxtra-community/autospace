import { Request, Response } from "express";
import { loginUser } from "../services/login.service";
import { generateTokenPair } from "../../../utils/jwt.util";

export const login = async (req: Request, res: Response) => {
  try {
    const user = await loginUser(req.body);

    // add access token //
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    return res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      user,
      message: "Login successful",
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
