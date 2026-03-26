"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = void 0;
const data_source_1 = require("../../../db/data-source");
const refreshtoken_entity_1 = require("../entities/refreshtoken.entity");
const jwt_util_1 = require("../../../utils/jwt.util");
const hash_utils_1 = require("../../../utils/hash.utils");
// import { env } from "../../../config/env.config";
const refresh = async (req, res) => {
    try {
        // console.log(" Refresh request received");
        // console.log("Cookies:", req.cookies);
        const refreshToken = req.cookies?.refreshToken;
        const COOKIE_SECURE = process.env.COOKIE_SECURE === "false";
        const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE === "none";
        if (!refreshToken) {
            // console.log(" No refresh token in cookies");
            return res.status(401).json({
                success: false,
                code: "REFRESH_TOKEN_MISSING",
                message: "Refresh token missing",
            });
        }
        const refreshRepo = data_source_1.AppDataSource.getRepository(refreshtoken_entity_1.RefreshToken);
        //  Hash incoming token
        const tokenHash = (0, hash_utils_1.hashToken)(refreshToken);
        //  Find token in DB
        // console.log(" Looking up token hash in database");
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
            // console.log(" Token expired at:", storedToken.expires_at);
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
        const tokens = (0, jwt_util_1.generateTokenPair)({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        //  Store new refresh token
        await refreshRepo.save({
            token_hash: (0, hash_utils_1.hashToken)(tokens.refreshToken),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            user,
        });
        const cookieOptions = {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SAMESITE,
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
        // console.log(" Token refreshed successfully for user:", user.id);
        // Return new access token
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: tokens.accessToken,
            },
        });
    }
    catch (err) {
        console.error("Refresh error", err);
        return res.status(500).json({
            success: false,
            message: "Token refresh failed",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.refresh = refresh;
