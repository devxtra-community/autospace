import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { generateTokenPair } from "../../../utils/jwt.util";
import { hashToken } from "../../../utils/hash.utils";
import { UserRole, UserStatus } from "../constants";

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const refreshRepo = AppDataSource.getRepository(RefreshToken);

    //  Hash incoming token
    const tokenHash = hashToken(refreshToken);

    //  Find token in DB
    const storedToken = await refreshRepo.findOne({
      where: { token_hash: tokenHash },
      relations: ["user"],
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    //  Check expiry
    if (storedToken.expires_at < new Date()) {
      await refreshRepo.delete({ id: storedToken.id });
      return res.status(401).json({ message: "Refresh token expired" });
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

    //  Set new cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return new access token
    return res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (err) {
    console.error("Refresh error", err);
    return res.status(500).json({ message: "Token refresh failed" });
  }
};
