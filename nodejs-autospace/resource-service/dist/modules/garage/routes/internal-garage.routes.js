"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const internalAuth_middleware_1 = require("../../../middlewares/internalAuth.middleware");
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
router.get("/:garageId", internalAuth_middleware_1.internalAuth, async (req, res) => {
    const garage = await repo.findOne({
        where: { id: req.params.garageId },
    });
    return res.json({
        success: true,
        data: garage,
    });
});
router.get("/count/:companyId", async (req, res) => {
    const count = await repo.count({
        where: { companyId: req.params.companyId },
    });
    res.json({
        success: true,
        data: { count },
    });
});
router.get("/manager/:managerId", internalAuth_middleware_1.internalAuth, async (req, res) => {
    const garage = await repo.findOne({
        where: {
            managerId: req.params.managerId,
        },
    });
    if (!garage) {
        return res.status(404).json({
            success: false,
            message: "Garage not found",
        });
    }
    return res.json({
        success: true,
        data: garage,
    });
});
router.get("/users/:userId/status", internalAuth_middleware_1.internalAuth, async (req, res) => {
    try {
        const userId = req.params.userId;
        let garage = await repo.findOne({ where: { managerId: userId } });
        if (!garage) {
            const valetRepo = data_source_1.AppDataSource.getRepository(require("../../valets/entities/valets.entity").Valet);
            const valet = await valetRepo.findOne({ where: { id: userId } });
            if (valet) {
                garage = await repo.findOne({ where: { id: valet.garageId } });
            }
        }
        if (!garage) {
            return res
                .status(404)
                .json({ success: false, message: "Garage not found for this user" });
        }
        return res.json({
            success: true,
            data: { status: garage.status },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error checking garage status" });
    }
});
exports.default = router;
