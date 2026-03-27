"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlotsByFloor = exports.getMyGarageFloors = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const garage_floor_entity_1 = require("../entities/garage-floor.entity");
const garage_slot_entity_1 = require("../entities/garage-slot.entity");
const getMyGarageFloors = async (managerId) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const garage = await garageRepo.findOne({
        where: { managerId },
    });
    if (!garage) {
        throw new Error("Garage not found for this manager");
    }
    const floors = await floorRepo.find({
        where: { garageId: garage.id },
        order: { floorNumber: "ASC" },
        select: ["id", "floorNumber", "createdAt"],
    });
    if (!floors.length) {
        throw new Error("No floors found in this garage");
    }
    return floors;
};
exports.getMyGarageFloors = getMyGarageFloors;
const getSlotsByFloor = async (managerId, floorId) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const garage = await garageRepo.findOne({
        where: { managerId },
    });
    if (!garage) {
        throw new Error("Garage not found for this manager");
    }
    const floor = await floorRepo.findOne({
        where: { id: floorId, garageId: garage.id },
    });
    if (!floor) {
        throw new Error("Floor not found in your garage");
    }
    const slots = await slotRepo.find({
        where: { floorId: floor.id },
        order: { slotNumber: "ASC" },
    });
    return slots;
};
exports.getSlotsByFloor = getSlotsByFloor;
