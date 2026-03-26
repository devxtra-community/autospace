"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const register_service_1 = require("../services/register.service");
const register = async (req, res) => {
    try {
        // Input is already validated by auth.validator middleware
        const user = await (0, register_service_1.registerUser)(req.body);
        const message = user.status === "pending"
            ? "Registration successful, await admin approval"
            : "Registration successful";
        return res.status(201).json({
            message,
            user,
        });
    }
    catch (error) {
        console.error("Register API error:", error);
        // Postgres unique constraint error (duplicate email)
        if (error instanceof Error &&
            "code" in error &&
            error.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({
            message: "Registration failed",
        });
    }
};
exports.register = register;
