import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { hashToken } from "../../../utils/hash.utils";
import { env } from "../../../config/env.config";

export const Logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const refreshRepo = AppDataSource.getRepository(refreshToken);
      await refreshRepo.delete({
        token_hash: hashToken(refreshToken),
      });
    }

    // Clear cookies (ALWAYS clear both)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};
