"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignValetToBooking = exports.releaseValetService = exports.getAllActiveValetsService = exports.markValetBusyService = exports.getAvailableValetService = exports.getValetsByGarageService = exports.rejectValetService = exports.approveValetService = void 0;
const data_source_1 = require("../../../db/data-source");
const valets_entity_1 = require("../entities/valets.entity");
const garage_entity_1 = require("../../garage/entities/garage.entity");
const axios_1 = __importDefault(require("axios"));
const rabbitmq_1 = require("../../../config/rabbitmq");
const approveValetService = async (valetId, managerUserId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const valet = await valetRepo.findOne({
        where: { id: valetId },
    });
    if (!valet)
        throw new Error("Valet not found");
    if (valet.employmentStatus !== valets_entity_1.ValetEmployementStatus.PENDING) {
        throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
    }
    const garage = await garageRepo.findOne({
        where: { id: valet.garageId },
    });
    if (!garage)
        throw new Error("Garage not found");
    if (garage.managerId !== managerUserId) {
        throw new Error("You are not the manager of this garage");
    }
    valet.employmentStatus = valets_entity_1.ValetEmployementStatus.ACTIVE;
    valet.approvedBy = managerUserId;
    return await valetRepo.save(valet);
};
exports.approveValetService = approveValetService;
const rejectValetService = async (valetId, managerUserId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const valet = await valetRepo.findOne({
        where: { id: valetId },
    });
    if (!valet)
        throw new Error("Valet not found");
    if (valet.employmentStatus !== valets_entity_1.ValetEmployementStatus.PENDING) {
        throw new Error(`Valet is already ${valet.employmentStatus.toLowerCase()}`);
    }
    const garage = await garageRepo.findOne({
        where: { id: valet.garageId },
    });
    if (!garage)
        throw new Error("Garage not found");
    if (garage.managerId !== managerUserId) {
        throw new Error("You are not the manager of this garage");
    }
    valet.employmentStatus = valets_entity_1.ValetEmployementStatus.REJECTED;
    valet.approvedBy = managerUserId;
    return await valetRepo.save(valet);
};
exports.rejectValetService = rejectValetService;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const getValetsByGarageService = async (garageId, managerUserId, filters) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const garage = await garageRepo.findOne({
        where: { id: garageId },
    });
    if (!garage)
        throw new Error("Garage not found");
    if (garage.managerId !== managerUserId)
        throw new Error("Not manager");
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where = {
        garageId,
    };
    if (filters.employmentStatus)
        where.employmentStatus = filters.employmentStatus;
    if (filters.availabilityStatus)
        where.availabilityStatus = filters.availabilityStatus;
    const [valets, total] = await valetRepo.findAndCount({
        where,
        skip,
        take: limit,
        order: {
            createdAt: "DESC",
        },
    });
    const users = await Promise.all(valets.map(async (valet) => {
        try {
            const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${valet.id}`, {
                headers: {
                    Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                    "x-user-id": "resource-service",
                    "x-user-role": "SERVICE",
                },
            });
            return res.data.data;
        }
        catch {
            return {
                id: valet.id,
                fullname: "",
                email: "",
                phone: "",
            };
        }
    }));
    let data = valets.map((valet) => {
        const user = users.find((u) => u.id === valet.id);
        return {
            id: valet.id,
            name: user?.fullname || "",
            email: user?.email || "",
            phone: user?.phone || "",
            employmentStatus: valet.employmentStatus,
            availabilityStatus: valet.availabilityStatus,
            createdAt: valet.createdAt,
        };
    });
    if (filters.search) {
        const s = filters.search.toLowerCase();
        data = data.filter((v) => v.name.toLowerCase().includes(s) ||
            v.email.toLowerCase().includes(s) ||
            v.phone.toLowerCase().includes(s));
    }
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getValetsByGarageService = getValetsByGarageService;
const getAvailableValetService = async (garageId, excludeIds) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const query = valetRepo
        .createQueryBuilder("valet")
        .where("valet.garageId = :garageId", { garageId })
        .andWhere("valet.employmentStatus = :employmentStatus", {
        employmentStatus: valets_entity_1.ValetEmployementStatus.ACTIVE,
    })
        .andWhere("valet.availabilityStatus = :availabilityStatus", {
        availabilityStatus: valets_entity_1.ValetAvailabilityStatus.AVAILABLE,
    })
        .orderBy("valet.createdAt", "ASC") // oldest first
        .limit(1);
    if (excludeIds?.length) {
        query.andWhere("valet.id NOT IN (:...excludeIds)", {
            excludeIds,
        });
    }
    const valet = await query.getOne();
    if (!valet)
        return null;
    // fetch user
    try {
        const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${valet.id}`, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
            },
        });
        const user = res.data.data;
        return {
            id: valet.id,
            name: user?.fullname ?? "",
            phone: user?.phone ?? "",
            availabilityStatus: valet.availabilityStatus,
            employmentStatus: valet.employmentStatus,
            garageId: valet.garageId,
        };
    }
    catch {
        return {
            id: valet.id,
            name: "",
            phone: "",
            availabilityStatus: valet.availabilityStatus,
            employmentStatus: valet.employmentStatus,
            garageId: valet.garageId,
        };
    }
};
exports.getAvailableValetService = getAvailableValetService;
const markValetBusyService = async (valetId, bookingId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const valet = await valetRepo.findOne({
        where: { id: valetId },
    });
    if (!valet)
        throw new Error("Valet not found");
    if (valet.availabilityStatus !== valets_entity_1.ValetAvailabilityStatus.AVAILABLE) {
        throw new Error("Valet not available");
    }
    valet.availabilityStatus = valets_entity_1.ValetAvailabilityStatus.BUSY;
    valet.currentBookingId = bookingId;
    return await valetRepo.save(valet);
};
exports.markValetBusyService = markValetBusyService;
const getAllActiveValetsService = async (garageId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const valets = await valetRepo.find({
        where: {
            garageId,
            employmentStatus: valets_entity_1.ValetEmployementStatus.ACTIVE,
            availabilityStatus: valets_entity_1.ValetAvailabilityStatus.AVAILABLE,
        },
        order: {
            createdAt: "ASC",
        },
    });
    const users = await Promise.all(valets.map(async (valet) => {
        try {
            const res = await axios_1.default.get(`${process.env.AUTH_SERVICE_URL}/internal/users/${valet.id}`, {
                headers: {
                    Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                },
            });
            return res.data.data;
        }
        catch {
            return null;
        }
    }));
    return valets.map((valet, index) => {
        const user = users[index];
        return {
            id: valet.id,
            name: user?.fullname || "",
            phone: user?.phone || "",
            email: user?.email || "",
            availabilityStatus: valet.availabilityStatus,
            employmentStatus: valet.employmentStatus,
            garageId: valet.garageId,
        };
    });
};
exports.getAllActiveValetsService = getAllActiveValetsService;
const releaseValetService = async (valetId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const valet = await valetRepo.findOne({
        where: { id: valetId },
    });
    if (!valet)
        throw new Error("Valet not found");
    valet.availabilityStatus = valets_entity_1.ValetAvailabilityStatus.AVAILABLE;
    valet.currentBookingId = null;
    return await valetRepo.save(valet);
};
exports.releaseValetService = releaseValetService;
const assignValetToBooking = async (bookingId, garageId) => {
    const valet = await (0, exports.getAvailableValetService)(garageId);
    if (!valet) {
        console.log("No available valet");
        return;
    }
    const valetId = valet.id;
    await (0, rabbitmq_1.publishEvent)("valet.request.created", {
        bookingId,
        valetId,
    });
    console.log("Valet request created:", {
        bookingId,
        valetId,
    });
};
exports.assignValetToBooking = assignValetToBooking;
