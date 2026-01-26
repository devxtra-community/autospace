import { Request, Response } from "express";
import { updateUserProfile } from "../services/auth.service";
import { getUserProfile } from "../services/auth.service";

export const getMyProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
      message: "Profile fetched successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await updateUserProfile(userId, req.body);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
