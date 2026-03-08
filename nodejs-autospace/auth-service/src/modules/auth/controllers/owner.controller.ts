import { Request, Response } from "express";
import { OwnerRegisterSchema } from "../validators/auth.api.schema";
import {
  getUserLoginStatsService,
  registerOwner,
} from "../services/owner-register.service";

export const ownerSignup = async (req: Request, res: Response) => {
  try {
    const data = OwnerRegisterSchema.parse(req.body);

    const user = await registerOwner(data);

    return res.status(201).json({
      message: "Owner registration successful",
      user,
    });
  } catch (error: unknown) {
    console.error("Owner register API error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return res.status(409).json({
        message: "Email or phone already exists",
      });
    }

    return res.status(500).json({
      message: "Owner registration failed",
    });
  }
};

export const getUserLoginStatsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getUserLoginStatsService();
    res.json(data);
  } catch (error) {
    console.error("User login stats API error:", error);
    res.status(500).json({
      message: "User login stats API failed",
    });
  }
};
// admin user stats
