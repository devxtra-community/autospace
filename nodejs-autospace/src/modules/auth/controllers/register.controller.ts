import { Request, Response } from "express";
import { registerUser } from "../services/register.service";

export const register = async (req: Request, res: Response) => {
  try {
    // Input is already validated by auth.validator middleware
    const user = await registerUser(req.body);

    return res.status(201).json({
      message: "Registration successful, await admin approval",
      user,
    });
  } catch (error: unknown) {
    console.error("Register API error", error);

    // Postgres unique constraint error (duplicate email)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};
