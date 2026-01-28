import { Request, Response } from "express";
import {
  getAllUsersService,
  updateUserProfile,
} from "../services/auth.service";
import { getUserProfile } from "../services/auth.service";
import { UserRole, UserStatus } from "../constants";

export const getMyProfileController = async (req: Request, res: Response) => {
  try {
    console.log("HEADERS:", req.headers);
    const userId = req.headers["x-user-id"] as string;

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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.headers["x-user-id"] as string;

    console.log("admin", adminUserId);

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const query = res.locals.query as {
      status?: UserStatus;
      role?: UserRole;
      search?: string;
      page: number;
      limit: number;
    };

    const result = await getAllUsersService(query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};
