import { Request, Response } from "express";
import { AppDataSource } from "../../../db/data-source";
import { RefreshToken } from "../entities/refreshtoken.entity";
import { hashToken } from "../../../utils/hash.utils";
// import { env } from "../../../config/env.config";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { PasswordResetToken } from "../entities/password-reset-token.entity";
import { User } from "../entities/user.entity";
import bcrypt from "bcrypt";

export const Logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    const COOKIE_SECURE = process.env.COOKIE_SECURE === "false";
    const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE === "none";

    if (refreshToken) {
      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      await refreshRepo.delete({
        token_hash: hashToken(refreshToken),
      });
    }

    // Clear cookies (ALWAYS clear both)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
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

// forget password

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const tokenRepo = AppDataSource.getRepository(PasswordResetToken);

    const user = await userRepo.findOne({ where: { email } });

    // Security: never reveal if user exists
    if (!user) {
      return res.json({
        message: "If the account exists, a reset link has been sent.",
      });
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await tokenRepo.delete({ userId: user.id });

    const resetToken = tokenRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await tokenRepo.save(resetToken);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "If the account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// reset password

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
    const userRepo = AppDataSource.getRepository(User);

    const resetToken = await tokenRepo.findOne({
      where: { token },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // check expiry
    if (resetToken.expiresAt < new Date()) {
      await tokenRepo.delete({ id: resetToken.id });

      return res.status(400).json({
        message: "Token expired",
      });
    }

    const user = await userRepo.findOne({
      where: { id: resetToken.userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password_hash = hashedPassword;

    await userRepo.save(user);

    // delete token after use
    await tokenRepo.delete({ id: resetToken.id });

    return res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
