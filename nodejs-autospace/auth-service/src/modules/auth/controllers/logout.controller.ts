import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { hashToken } from "../../../utils/hash.utils";
import { env } from "../../../config/env.config";

export const Logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const refreshRepo = AppDataSource.getRepository(RefreshToken);
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
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

// export const getMe = (req: Request, res: Response) => {
//   const user = req.user; // injected by API Gateway

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       error: {
//         code: "UNAUTHORIZED",
//         message: "User not authenticated",
//       },
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     data: {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//     },
//   });
// };
