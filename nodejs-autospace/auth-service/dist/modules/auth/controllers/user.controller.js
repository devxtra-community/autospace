"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAmdinUsers = exports.getAllUsers = exports.updateProfileController = exports.getMyProfileController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_service_2 = require("../services/auth.service");
// import { success } from "zod";
const getMyProfileController = async (req, res) => {
    try {
        console.log("HEADERS:", req.headers);
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const profile = await (0, auth_service_2.getUserProfile)(userId);
        return res.status(200).json({
            success: true,
            data: profile,
            message: "Profile fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch profile",
        });
    }
};
exports.getMyProfileController = getMyProfileController;
const updateProfileController = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await (0, auth_service_1.updateUserProfile)(userId, req.body);
        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update profile",
        });
    }
};
exports.updateProfileController = updateProfileController;
const getAllUsers = async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
        const adminUserId = req.headers["x-user-id"];
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
                ? String(req.query.role).toLowerCase()
                : undefined,
            status: req.query.status
                ? String(req.query.status).toLowerCase()
                : undefined,
        };
        const result = await (0, auth_service_1.getAllUsersService)(query);
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Failed to get users",
        });
    }
};
exports.getAllUsers = getAllUsers;
const updateAmdinUsers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const adminUserId = req.headers["x-user-id"];
        const { status } = req.body;
        console.log("status", status);
        if (!adminUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const updated = await (0, auth_service_1.updateUserStatus)(userId, status);
        return res.status(200).json({
            success: true,
            message: "updated successfully",
            data: updated.data,
        });
    }
    catch (error) {
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
exports.updateAmdinUsers = updateAmdinUsers;
