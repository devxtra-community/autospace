"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLoginStatsController = exports.ownerSignup = void 0;
const auth_api_schema_1 = require("../validators/auth.api.schema");
const owner_register_service_1 = require("../services/owner-register.service");
const ownerSignup = async (req, res) => {
    try {
        const data = auth_api_schema_1.OwnerRegisterSchema.parse(req.body);
        const user = await (0, owner_register_service_1.registerOwner)(data);
        return res.status(201).json({
            message: "Owner registration successful",
            user,
        });
    }
    catch (error) {
        console.error("Owner register API error:", error);
        if (error instanceof Error &&
            "code" in error &&
            error.code === "23505") {
            return res.status(409).json({
                message: "Email or phone already exists",
            });
        }
        return res.status(500).json({
            message: "Owner registration failed",
        });
    }
};
exports.ownerSignup = ownerSignup;
const getUserLoginStatsController = async (req, res) => {
    try {
        const data = await (0, owner_register_service_1.getUserLoginStatsService)();
        res.json(data);
    }
    catch (error) {
        console.error("User login stats API error:", error);
        res.status(500).json({
            message: "User login stats API failed",
        });
    }
};
exports.getUserLoginStatsController = getUserLoginStatsController;
// admin user stats
