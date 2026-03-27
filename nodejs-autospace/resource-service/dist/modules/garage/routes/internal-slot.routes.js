"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const internalAuth_middleware_1 = require("../../../middlewares/internalAuth.middleware");
const data_source_1 = require("../../../db/data-source");
const garage_slot_entity_1 = require("../entities/garage-slot.entity");
const router = (0, express_1.Router)();
router.get("/:slotId", internalAuth_middleware_1.internalAuth, async (req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const slot = await repo.findOne({
        where: { id: req.params.slotId },
        relations: ["floor"],
    });
    if (!slot) {
        return res.status(404).json({
            success: false,
            message: "Slot not found",
        });
    }
    return res.json({
        success: true,
        data: {
            id: slot.id,
            slotNumber: slot.slotNumber,
            floorNumber: slot.floor.floorNumber,
            slotSize: slot.slotSize,
        },
    });
});
exports.default = router;
