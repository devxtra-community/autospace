"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const router = (0, express_1.Router)();
router.get("/:userId", async (req, res) => {
    try {
        const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
        const user = await userRepo.findOne({
            where: { id: req.params.userId },
            select: ["id", "fullname", "phone", "email"],
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
});
exports.default = router;
