"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const login_service_1 = require("../services/login.service");
const env_config_1 = require("../../../config/env.config");
const login = async (req, res) => {
    try {
        const { user, tokens } = await (0, login_service_1.loginUser)(req.body);
        console.log("RAW BODY:", env_config_1.env.COOKIE_SAMESITE, env_config_1.env.COOKIE_SECURE);
        const cookieOptions = {
            httpOnly: true,
            secure: env_config_1.env.COOKIE_SECURE,
            sameSite: env_config_1.env.COOKIE_SAMESITE,
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
            message: "Login successful",
            user,
        });
    }
    catch (error) {
        console.error("Login API error", error);
        if (error instanceof Error) {
            if (error.message === "Invalid credentials") {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: "INVALID_CREDENTIALS",
                        message: "Invalid email or password",
                    },
                });
            }
            if (error.message === "User not approved") {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: "USER_NOT_APPROVED",
                        message: "Your account is pending approval",
                    },
                });
            }
            if (error.message === "GARAGE_BLOCKED") {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: "GARAGE_BLOCKED",
                        message: "Your garage has been blocked by the authority",
                    },
                });
            }
        }
        return res.status(500).json({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: "Something went wrong",
            },
        });
    }
};
exports.login = login;
