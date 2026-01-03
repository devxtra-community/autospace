import { Request, Response } from "express";
import { registerSchema } from "../validators/register.schema";
import { registerUser } from "../services/register.service";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body); // validate req body by using zod schema
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errrors: parsed.error.flatten(),
    });
  }
  try {
    const user = await registerUser(parsed.data); // create user in DB by calling service
    return res.status(201).json({
      message: "Registration successful , Await admin approval",
      user,
    });
  } catch (error: unknown) {
    console.error("Register API error", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      // postgres unique constraint error (duplicate email case)
      return res.status(409).json({ message: "Email already exists" });
    }
  }

  return res.status(500).json({
    message: "Registration failed",
  });
};
