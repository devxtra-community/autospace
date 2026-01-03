import { Request, Response } from "express";
import { loginUser } from "../services/login.service";

export const login = async (req: Request, res: Response) => {
  try {
    const user = await loginUser(req.body);
    return res.status(200).json({
      message: "Login successful",
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
