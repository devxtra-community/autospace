"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const google_login_service_1 = require("../services/google-login.service");
// import { env } from "../../../config/env.config";
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const { user, tokens } = await (0, google_login_service_1.googleLoginService)(token);
        const COOKIE_SECURE = process.env.COOKIE_SECURE === "false";
        const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE === "none";
        const cookieOptions = {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SAMESITE,
            path: "/",
        };
        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            message: "Google login successful",
            user,
        });
    }
    catch (error) {
        console.error("Google login error", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "GOOGLE_LOGIN_FAILED",
                message: "Google authentication failed",
            },
        });
    }
};
exports.googleLogin = googleLogin;
