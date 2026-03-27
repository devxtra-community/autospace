"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGaragesByCompanyId = exports.getAllGarages = exports.getGarageById = exports.assignManagerToGarage = void 0;
const data_source_1 = require("../../../db/data-source");
const garage_entity_1 = require("../entities/garage.entity");
const company_entity_1 = require("../../company/entities/company.entity");
const axios_1 = __importDefault(require("axios"));
const garage_slot_entity_1 = require("../entities/garage-slot.entity");
const garage_floor_entity_1 = require("../entities/garage-floor.entity");
const valets_entity_1 = require("../../valets/entities/valets.entity");
const typeorm_1 = require("typeorm");
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const assignManagerToGarage = async (ownerUserId, garageCode, managerId) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const company = await companyRepo.findOne({
        where: {
            ownerUserId,
            status: company_entity_1.CompanyStatus.ACTIVE,
        },
    });
    if (!company)
        throw new Error("Active company not found");
    const garage = await garageRepo.findOne({
        where: {
            garageRegistrationNumber: garageCode,
            companyId: company.id,
            status: garage_entity_1.GarageStatus.ACTIVE,
        },
    });
    if (!garage)
        throw new Error("Garage not found");
    if (garage.managerId)
        throw new Error("Garage already has manager");
    // FIXED endpoint
    const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${managerId}`, {
        headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
            "x-user-id": "resource-service",
            "x-user-role": "SERVICE",
        },
    });
    const manager = res.data.data;
    if (!manager)
        throw new Error("Manager not found");
    if (manager.role !== "manager")
        throw new Error("User is not manager");
    if (manager.companyId !== company.id)
        throw new Error("Manager not from this company");
    if (manager.managerState !== "unassigned")
        throw new Error("Manager already assigned");
    garage.managerId = managerId;
    await garageRepo.save(garage);
    try {
        await axios_1.default.post(`${AUTH_SERVICE_URL}/internal/users/${managerId}/assign`, {}, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "resource-service",
                "x-user-role": "SERVICE",
            },
        });
    }
    catch (error) {
        // ROLLBACK: If Auth service call fails, remove managerId from garage
        console.error("Failed to assign manager in Auth service, rolling back Resource service change", error);
        garage.managerId = null;
        await garageRepo.save(garage);
        throw new Error("Failed to synchronize manager assignment with Auth service");
    }
    return {
        garageCode,
        managerId,
    };
};
exports.assignManagerToGarage = assignManagerToGarage;
const getGarageById = async (garageId) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const garage = await repo.findOne({
        where: { id: garageId },
    });
    if (!garage) {
        throw new Error("Garage not found");
    }
    if (!garage.managerId) {
        return {
            ...garage,
            manager: null,
        };
    }
    try {
        const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${garage.managerId}`, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "resource-service",
                "x-user-role": "SERVICE",
            },
        });
        const user = res.data?.data;
        return {
            ...garage,
            valetServiceRadius: garage.valetServiceRadius,
            manager: user
                ? {
                    fullname: user.fullname || user.email || "Manager",
                }
                : null,
        };
    }
    catch {
        return {
            ...garage,
            valetServiceRadius: garage.valetServiceRadius,
            manager: null,
        };
    }
};
exports.getGarageById = getGarageById;
const getAllGarages = async (page = 1, limit = 10, search, status) => {
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const floorRepo = data_source_1.AppDataSource.getRepository(garage_floor_entity_1.GarageFloor);
    const slotRepo = data_source_1.AppDataSource.getRepository(garage_slot_entity_1.GarageSlot);
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const where = {};
    // search filter
    if (search) {
        where.name = (0, typeorm_1.ILike)(`%${search}%`);
    }
    // status filter
    if (status && status !== "all") {
        where.status = status;
    }
    const [garages, total] = await garageRepo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
    });
    const enriched = await Promise.all(garages.map(async (garage) => {
        let managerName = "Not assigned";
        if (garage.managerId) {
            try {
                const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${garage.managerId}`, {
                    headers: {
                        "x-user-id": "resource-service",
                        "x-user-role": "SERVICE",
                    },
                });
                managerName = res.data?.data?.fullname || "Unknown";
            }
            catch {
                managerName = "Unknown";
            }
        }
        const floorCount = await floorRepo.count({
            where: { garageId: garage.id },
        });
        const slotCount = await slotRepo
            .createQueryBuilder("slot")
            .innerJoin("slot.floor", "floor")
            .where("floor.garageId = :garageId", {
            garageId: garage.id,
        })
            .getCount();
        const valetCount = await valetRepo.count({
            where: {
                garageId: garage.id,
                employmentStatus: valets_entity_1.ValetEmployementStatus.ACTIVE,
            },
        });
        return {
            garageId: garage.id,
            garageCode: garage.garageRegistrationNumber,
            name: garage.name,
            managerName,
            contactEmail: garage.contactEmail,
            contactPhone: garage.contactPhone,
            locationName: garage.locationName,
            capacity: garage.capacity,
            floorCount,
            slotCount,
            valetCount,
            status: garage.status,
            createdAt: garage.createdAt,
            valetServiceRadius: garage.valetServiceRadius,
            companyId: garage.companyId,
        };
    }));
    return {
        data: enriched,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllGarages = getAllGarages;
const getGaragesByCompanyId = async (companyId, filters) => {
    const repo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const search = filters.search;
    const status = filters.status;
    const qb = repo
        .createQueryBuilder("garage")
        .where("garage.companyId = :companyId", { companyId });
    /* SEARCH */
    if (search) {
        qb.andWhere(`(LOWER(garage.name) LIKE :search
        OR LOWER(garage.locationName) LIKE :search
        OR LOWER(garage.garageRegistrationNumber) LIKE :search)`, { search: `%${search.toLowerCase()}%` });
    }
    if (filters.managerFilter === "assigned") {
        qb.andWhere("garage.managerId IS NOT NULL");
    }
    if (filters.managerFilter === "unassigned") {
        qb.andWhere("garage.managerId IS NULL");
    }
    /* STATUS FILTER */
    if (status) {
        qb.andWhere("garage.status = :status", { status });
    }
    qb.orderBy("garage.createdAt", "DESC")
        .skip((page - 1) * limit)
        .take(limit);
    const [garages, total] = await qb.getManyAndCount();
    /* ENRICH MANAGER */
    const enriched = await Promise.all(garages.map(async (garage) => {
        if (!garage.managerId) {
            return { ...garage, manager: null };
        }
        try {
            const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${garage.managerId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                    "x-user-id": "resource-service",
                    "x-user-role": "SERVICE",
                },
            });
            const user = res.data?.data;
            return {
                ...garage,
                valetServiceRadius: garage.valetServiceRadius,
                manager: user
                    ? {
                        fullname: user.fullname || user.email || "Manager",
                    }
                    : null,
            };
        }
        catch {
            return {
                ...garage,
                valetServiceRadius: garage.valetServiceRadius,
                manager: null,
            };
        }
    }));
    return {
        data: enriched,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getGaragesByCompanyId = getGaragesByCompanyId;
