import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { generateTokenPair } from "../../../utils/jwt.util";
import { hashToken } from "../../../utils/hash.utils";
import { UserRole, UserStatus } from "../constants";
import { env } from "../../../config/env.config";

export const refresh = async (req: Request, res: Response) => {
  try {
    console.log(" Refresh request received");
    console.log("Cookies:", req.cookies);
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      console.log(" No refresh token in cookies");
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token missing",
      });
    }

    const refreshRepo = AppDataSource.getRepository(RefreshToken);

    //  Hash incoming token
    const tokenHash = hashToken(refreshToken);

    //  Find token in DB
    console.log(" Looking up token hash in database");
    const storedToken = await refreshRepo.findOne({
      where: { token_hash: tokenHash },
      relations: ["user"],
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_INVALID",
        message: "Invalid refresh token",
      });
    }

    //  Check expiry
    if (storedToken.expires_at < new Date()) {
      console.log(" Token expired at:", storedToken.expires_at);
      await refreshRepo.delete({ id: storedToken.id });
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired",
      });
    }

    const user = storedToken.user;

    //  Rotate token (delete old)
    await refreshRepo.delete({ id: storedToken.id });

    //  Generate new token pair
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      status: user.status as UserStatus,
    });

    //  Store new refresh token
    await refreshRepo.save({
      token_hash: hashToken(tokens.refreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      path: "/",
    };

    //  Set new cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    console.log(" Token refreshed successfully for user:", user.id);

    // Return new access token
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (err) {
    console.error("Refresh error", err);
    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
