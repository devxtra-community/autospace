"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicAvailableSlotsService = exports.getGarageSlotsByFloor = exports.getGarageSlots = exports.createGarageSlot = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_slot_entity_1 = require("../entities/garage-slot.entity");
const garage_floor_entity_1 = require("../entities/garage-floor.entity");
const garage_entity_1 = require("../entities/garage.entity");
const typeorm_1 = require("typeorm");
const redis_1 = __importDefault(require("../../../config/redis"));
const createGarageSlot = async (managerId, floorNumber, slotNumber, slotSize) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const garage = await garageRepo.findOne({ where: { managerId } });
    if (!garage) {
        throw new Error("No garage assigned to this manager");
    }
    const floor = await floorRepo.findOne({
        where: { garageId: garage.id, floorNumber },
    });
    if (!floor) {
        throw new Error(`Floor ${floorNumber} not found in your garage`);
    }
    const match = slotNumber.match(/^([A-Z])([1-5])$/);
    if (!match) {
        throw new Error("Invalid slot number. Use A1–A5, B1–B5, etc.");
    }
    const letter = match[1];
    const sameLetterCount = await slotRepo.count({
        where: {
            floorId: floor.id,
            slotNumber: (0, typeorm_1.Like)(`${letter}%`),
        },
    });
    if (sameLetterCount >= 5) {
        throw new Error(`Slot group ${letter} already has 5 slots`);
    }
    const floors = await floorRepo.find({
        where: { garageId: garage.id },
        select: ["id"],
    });
    const totalSlotsInGarage = await slotRepo.count({
        where: {
            floorId: (0, typeorm_1.In)(floors.map((f) => f.id)),
        },
    });
    if (totalSlotsInGarage >= garage.capacity) {
        throw new Error("Garage capacity exceeded");
    }
    const existingSlot = await slotRepo.findOne({
        where: { floorId: floor.id, slotNumber },
    });
    if (existingSlot) {
        throw new Error(`Slot ${slotNumber} already exists on this floor`);
    }
    const pricePerHour = slotSize === garage_slot_entity_1.SlotSize.STANDARD
        ? garage.standardSlotPrice
        : garage.largeSlotPrice;
    const slot = slotRepo.create({
        floorId: floor.id,
        slotNumber,
        slotSize,
        pricePerHour,
        status: "AVAILABLE",
    });
    await slotRepo.save(slot);
    await redis_1.default.del(`slots:available:${garage.id}`);
    return slot;
};
exports.createGarageSlot = createGarageSlot;
const getGarageSlots = async (managerId) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const garage = await garageRepo.findOne({ where: { managerId } });
    if (!garage) {
        throw new Error("garage not found");
    }
    const floors = await floorRepo.find({
        where: { garageId: garage.id },
        select: ["id"],
    });
    return slotRepo.find({
        where: { floorId: (0, typeorm_1.In)(floors.map((f) => f.id)) },
        order: { slotNumber: "ASC" },
    });
};
exports.getGarageSlots = getGarageSlots;
const getGarageSlotsByFloor = async (managerId, floorId) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const garage = await garageRepo.findOne({ where: { managerId } });
    if (!garage)
        throw new Error("garage not found");
    return slotRepo.find({
        where: { floorId },
        order: { slotNumber: "ASC" },
    });
};
exports.getGarageSlotsByFloor = getGarageSlotsByFloor;
const getPublicAvailableSlotsService = async ({ garageId, }) => {
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const cacheKey = `slots:available:${garageId}`;
    const cached = await redis_1.default.get(cacheKey);
    if (cached) {
        console.log("Slots from Redis cache");
        return JSON.parse(cached);
    }
    const slots = await slotRepo.find({
        where: {
            floor: {
                garage: {
                    id: garageId,
                },
            },
        },
        relations: ["floor", "floor.garage"],
        order: {
            floor: {
                floorNumber: "ASC",
            },
            slotNumber: "ASC",
        },
    });
    const result = slots.map((slot) => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        floor: slot.floor.floorNumber,
        name: slot.slotNumber,
        status: slot.status === "AVAILABLE"
            ? "available"
            : slot.status === "RESERVED"
                ? "booked"
                : "disabled",
    }));
    await redis_1.default.set(cacheKey, JSON.stringify(result), { EX: 60 });
    console.log("Slots from DB and cached");
    return result;
};
exports.getPublicAvailableSlotsService = getPublicAvailableSlotsService;
