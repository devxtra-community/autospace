import { Request, Response } from "express";
import {
  getAllUsersService,
  updateUserProfile,
  updateUserStatus,
} from "../services/auth.service";
import { getUserProfile } from "../services/auth.service";
import { UserStatus, UserRole } from "../constants";
// import { success } from "zod";

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
  res.set("Cache-Control", "no-store");

  try {
    const adminUserId = req.headers["x-user-id"] as string;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: req.query.search ? String(req.query.search) : undefined,

      role: req.query.role
        ? (String(req.query.role).toLowerCase() as UserRole)
        : undefined,

      status: req.query.status
        ? (String(req.query.status).toLowerCase() as UserStatus)
        : undefined,
    };

    const result = await getAllUsersService(query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

export const updateAmdinUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const adminUserId = req.headers["x-user-id"] as string;

    const { status } = req.body;

    console.log("status", status);

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await updateUserStatus(userId, status);

    return res.status(200).json({
      success: true,
      message: "updated successfully",
      data: updated.data,
    });
  } catch (error: unknown) {
    //  Proper Type Narrowing
    let message = "Failed to update user status";

    if (error instanceof Error) {
      message = error.message;
    }

    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message,
    });
  }
};
