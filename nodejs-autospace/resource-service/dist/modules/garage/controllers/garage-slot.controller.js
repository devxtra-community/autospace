"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlotByIdInternal = exports.getPublicAvailableSlotsController = exports.getSlotsByFloorController = exports.getSlotController = exports.createGarageSlotController = void 0;
exports.getGarageByManager = getGarageByManager;
const garage_slot_service_1 = require("../services/garage-slot.service");
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const garage_slot_entity_1 = require("../entities/garage-slot.entity");
const createGarageSlotController = async (req, res) => {
    try {
        const managerId = req.user.id;
        const role = req.user.role;
        if (role !== "manager") {
            return res.status(403).json({
                success: false,
                message: "Only managers can create slots",
            });
        }
        const { floorNumber, slotNumber, slotSize } = req.body;
        if (floorNumber == null || !slotNumber || !slotSize) {
            return res.status(400).json({
                success: false,
                message: "floorNumber, slotNumber and slotSize are required",
            });
        }
        const slot = await (0, garage_slot_service_1.createGarageSlot)(managerId, floorNumber, slotNumber, slotSize);
        return res.status(201).json({
            success: true,
            message: "Slot created successfully",
            data: slot,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createGarageSlotController = createGarageSlotController;
const getSlotController = async (req, res) => {
    try {
        const managerId = req.user.id;
        console.log("manager", managerId);
        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const slots = await (0, garage_slot_service_1.getGarageSlots)(managerId);
        return res.status(200).json({
            success: true,
            data: slots,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getSlotController = getSlotController;
const getSlotsByFloorController = async (req, res) => {
    try {
        const managerId = req.user.id;
        const floorId = req.params.floorId;
        const slots = await (0, garage_slot_service_1.getGarageSlotsByFloor)(managerId, floorId);
        return res.status(200).json({
            success: true,
            data: slots,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getSlotsByFloorController = getSlotsByFloorController;
const getPublicAvailableSlotsController = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        const { startTime, endTime } = req.query;
        if (!garageId) {
            return res.status(400).json({
                success: false,
                message: "garageId is required",
            });
        }
        const slots = await (0, garage_slot_service_1.getPublicAvailableSlotsService)({
            garageId,
            startTime,
            endTime,
        });
        return res.status(200).json({
            success: true,
            data: slots,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch available slots",
        });
    }
};
exports.getPublicAvailableSlotsController = getPublicAvailableSlotsController;
async function getGarageByManager(req, res) {
    const { managerId } = req.params;
    const garage = await data_source_1.AppDataSource.getRepository(garage_entity_1.Garage)
        .createQueryBuilder("g")
        .where("g.managerId = :managerId", { managerId })
        .select(["g.id"])
        .getOne();
    console.log("reosurce garageid", garage?.id);
    if (!garage) {
        return res.status(404).json({
            success: false,
            message: "Garage not found for this manager",
        });
    }
    return res.json({
        success: true,
        data: { garageId: garage.id },
    });
}
const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
const getSlotByIdInternal = async (req, res) => {
    try {
        const slotId = String(req.params.slotId);
        const slot = await slotRepo
            .createQueryBuilder("slot")
            .leftJoinAndSelect("slot.floor", "floor")
            .where("slot.id = :slotId", { slotId })
            .select([
            "slot.id",
            "slot.slotNumber",
            "slot.slotSize",
            "slot.status",
            "floor.id",
            "floor.floorNumber",
        ])
            .getOne();
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
                slotSize: slot.slotSize,
                status: slot.status,
                floorNumber: slot.floor.floorNumber,
                floorId: slot.floor.id,
            },
        });
    }
    catch (err) {
        console.error("Internal slot fetch error", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch slot",
        });
    }
};
exports.getSlotByIdInternal = getSlotByIdInternal;
