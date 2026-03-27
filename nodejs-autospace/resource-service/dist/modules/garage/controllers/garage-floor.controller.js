"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlotByFloorController = exports.getMyFloorsController = exports.createGarageFloorController = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_floor_entity_1 = require("../entities/garage-floor.entity");
const garage_entity_1 = require("../entities/garage.entity");
const garage_floor_service_1 = require("../services/garage-floor.service");
const createGarageFloorController = async (req, res) => {
    const managerId = req.user.id;
    const role = req.user.role;
    if (!managerId || role !== "manager") {
        return res.status(403).json({
            success: false,
            message: "Only managers can create floors",
        });
    }
    const { floorNumber } = req.body;
    if (floorNumber == null) {
        return res.status(400).json({
            success: false,
            message: "floorNumber is required",
        });
    }
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const garage = await garageRepo.findOne({
        where: { managerId },
    });
    if (!garage) {
        return res.status(404).json({
            success: false,
            message: "Garage not found for this manager",
        });
    }
    const existingFloor = await floorRepo.findOne({
        where: {
            garageId: garage.id,
            floorNumber,
        },
    });
    if (existingFloor) {
        return res.status(400).json({
            success: false,
            message: `Floor ${floorNumber} already exists`,
        });
    }
    const floor = floorRepo.create({
        garageId: garage.id,
        floorNumber,
    });
    await floorRepo.save(floor);
    return res.status(201).json({
        success: true,
        message: "Floor created successfully",
        data: floor,
    });
};
exports.createGarageFloorController = createGarageFloorController;
const getMyFloorsController = async (req, res) => {
    try {
        const managerId = req.user.id;
        console.log("manager", managerId);
        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const floors = await (0, garage_floor_service_1.getMyGarageFloors)(managerId);
        return res.status(200).json({
            success: true,
            message: "Garage floors fetched successfully",
            data: floors,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garage floors",
        });
    }
};
exports.getMyFloorsController = getMyFloorsController;
const getSlotByFloorController = async (res, req) => {
    try {
        const managerId = req.user.id;
        const floorIdParam = req.params.floorId;
        const floorId = Array.isArray(floorIdParam)
            ? floorIdParam[0]
            : floorIdParam;
        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        if (!floorId) {
            return res.status(400).json({
                success: false,
                message: "floorId is required",
            });
        }
        const slots = await (0, garage_floor_service_1.getSlotsByFloor)(managerId, floorId);
        return res.status(200).json({
            success: true,
            message: "Garage slot by floor fetched successfully",
            data: slots,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garage floors by slot",
        });
    }
};
exports.getSlotByFloorController = getSlotByFloorController;
