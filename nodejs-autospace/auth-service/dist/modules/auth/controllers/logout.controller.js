"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.Logout = void 0;
const data_source_1 = require("../../../db/data-source");
const refreshtoken_entity_1 = require("../entities/refreshtoken.entity");
const hash_utils_1 = require("../../../utils/hash.utils");
const env_config_1 = require("../../../config/env.config");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const password_reset_token_entity_1 = require("../entities/password-reset-token.entity");
const user_entity_1 = require("../entities/user.entity");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            const refreshRepo = data_source_1.AppDataSource.getRepository(refreshtoken_entity_1.RefreshToken);
            await refreshRepo.delete({
                token_hash: (0, hash_utils_1.hashToken)(refreshToken),
            });
        }
        // Clear cookies (ALWAYS clear both)
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: env_config_1.env.COOKIE_SECURE,
            sameSite: env_config_1.env.COOKIE_SAMESITE,
            path: "/",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env_config_1.env.COOKIE_SECURE,
            sameSite: env_config_1.env.COOKIE_SAMESITE,
            path: "/",
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
};
exports.Logout = Logout;
// forget password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
        const tokenRepo = data_source_1.AppDataSource.getRepository(password_reset_token_entity_1.PasswordResetToken);
        const user = await userRepo.findOne({ where: { email } });
        // Security: never reveal if user exists
        if (!user) {
            return res.json({
                message: "If the account exists, a reset link has been sent.",
            });
        }
        // generate token
        const token = crypto_1.default.randomBytes(32).toString("hex");
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
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
exports.forgotPassword = forgotPassword;
// reset password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const tokenRepo = data_source_1.AppDataSource.getRepository(password_reset_token_entity_1.PasswordResetToken);
        const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        user.password_hash = hashedPassword;
        await userRepo.save(user);
        // delete token after use
        await tokenRepo.delete({ id: resetToken.id });
        return res.json({
            message: "Password reset successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
exports.resetPassword = resetPassword;
