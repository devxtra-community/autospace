"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyManagerGarageService = exports.updateGarageProfile = exports.updateGarageStatus = exports.getGarageByStatus = exports.createGarage = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const company_entity_1 = require("../../company/entities/company.entity");
const redis_1 = __importDefault(require("../../../config/redis"));
const valets_entity_1 = require("../../valets/entities/valets.entity");
const createGarage = async (ownerUserId, data) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const company = await companyRepo.findOne({
        where: {
            ownerUserId: ownerUserId,
            status: company_entity_1.CompanyStatus.ACTIVE,
        },
    });
    if (!company) {
        throw new Error("Company not found or not approved");
    }
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
        throw new Error("Latitude and longitude are required");
    }
    const exists = await garageRepo.findOne({
        where: { companyId: company.id, name: data.name },
    });
    if (exists) {
        throw new Error("Garage already exists for this Company");
    }
    const result = await data_source_1.AppDataSource.query(`SELECT nextval('garage_grn_seq') as seq`);
    const seqNumber = result[0].seq;
    const garageRegistrationNumber = `GR-${String(seqNumber).padStart(4, "0")}`;
    console.log("CREATE GARAGE INPUT:", data);
    const garage = garageRepo.create({
        name: data.name,
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
        capacity: data.capacity,
        contactEmail: data.contactEmail ?? null,
        contactPhone: data.contactPhone ?? null,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        companyId: company.id,
        garageRegistrationNumber,
        createdBy: ownerUserId,
        status: garage_entity_1.GarageStatus.PENDING,
        ...(data.valetServiceRadius !== undefined && {
            valetServiceRadius: data.valetServiceRadius,
        }),
    });
    const saved = await garageRepo.save(garage);
    return {
        id: saved.id,
        name: saved.name,
        locationName: saved.locationName,
        openingTime: saved.openingTime,
        closingTime: saved.closingTime,
        latitude: saved.latitude,
        longitude: saved.longitude,
        contactEmail: saved.contactEmail,
        contactPhone: saved.contactPhone,
        status: saved.status,
        garageRegistrationNumber,
        valetServiceRadius: saved.valetServiceRadius,
        createdAt: saved.createdAt,
    };
};
exports.createGarage = createGarage;
const getGarageByStatus = async (status, page = 1, limit = 10) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const [data, total] = await repo.findAndCount({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
    });
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getGarageByStatus = getGarageByStatus;
const updateGarageStatus = async (companyId, status, adminUserId) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const garage = await repo.findOne({
        where: { id: companyId },
    });
    if (!garage) {
        throw new Error("Garage not found");
    }
    // Valid transitions:
    // PENDING  → ACTIVE, REJECTED
    // ACTIVE   → BLOCKED, REJECTED
    // BLOCKED  → ACTIVE
    // REJECTED → ACTIVE
    const validTransitions = {
        [garage_entity_1.GarageStatus.PENDING]: [garage_entity_1.GarageStatus.ACTIVE, garage_entity_1.GarageStatus.REJECTED],
        [garage_entity_1.GarageStatus.ACTIVE]: [garage_entity_1.GarageStatus.BLOCKED, garage_entity_1.GarageStatus.REJECTED],
        [garage_entity_1.GarageStatus.BLOCKED]: [garage_entity_1.GarageStatus.ACTIVE],
        [garage_entity_1.GarageStatus.REJECTED]: [garage_entity_1.GarageStatus.ACTIVE],
    };
    const allowed = validTransitions[garage.status] ?? [];
    if (!allowed.includes(status)) {
        throw new Error(`Cannot transition garage from '${garage.status}' to '${status}'`);
    }
    garage.status = status;
    await repo.save(garage);
    await redis_1.default.del(`garage:${companyId}`);
    console.log(`[AUDIT] Admin ${adminUserId} set garage ${companyId} from ${garage.status} to ${status}`);
    return garage;
};
exports.updateGarageStatus = updateGarageStatus;
const updateGarageProfile = async (garageId, data) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const garage = await repo.findOne({ where: { id: garageId } });
    if (!garage) {
        throw new Error("Garage not found");
    }
    if (data.name !== undefined)
        garage.name = data.name;
    if (data.contactEmail !== undefined)
        garage.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined)
        garage.contactPhone = data.contactPhone;
    if (data.valetAvailable !== undefined)
        garage.valetAvailable = data.valetAvailable;
    if (data.capacity !== undefined)
        garage.capacity = data.capacity;
    if (data.valetServiceRadius !== undefined)
        garage.valetServiceRadius = data.valetServiceRadius;
    await repo.save(garage);
    return garage;
};
exports.updateGarageProfile = updateGarageProfile;
const getMyManagerGarageService = async (managerId) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const garage = await garageRepo.findOne({
        where: { managerId },
    });
    if (!garage) {
        throw new Error("Garage not found for this manager");
    }
    const activeValetCount = await valetRepo.count({
        where: {
            garageId: garage.id,
            employmentStatus: valets_entity_1.ValetEmployementStatus.ACTIVE,
        },
    });
    return {
        ...garage,
        activeValetCount,
    };
};
exports.getMyManagerGarageService = getMyManagerGarageService;
