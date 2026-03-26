"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyEmployeesService = void 0;
const data_source_1 = require("../../../db/data-source");
const valets_entity_1 = require("../../valets/entities/valets.entity");
const garage_entity_1 = require("../../garage/entities/garage.entity");
const axios_1 = __importDefault(require("axios"));
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
// console.log("urlee",process.env.AUTH_SERVICE_URL);
const getCompanyEmployeesService = async (companyId, filters) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    let employees = [];
    const garages = await garageRepo.find({
        where: { companyId },
        select: ["id", "name", "managerId"],
    });
    const garageMap = new Map(garages.map((g) => [g.id, g.name]));
    if (!filters.role || filters.role === "VALET") {
        const valets = await valetRepo.find({
            where: {
                companyId,
                ...(filters.employmentStatus && {
                    employmentStatus: filters.employmentStatus,
                }),
            },
        });
        employees.push(...valets.map((v) => ({
            userId: v.id,
            role: "VALET",
            garageId: v.garageId,
            garageName: garageMap.get(v.garageId) || null,
            employmentStatus: v.employmentStatus,
        })));
    }
    if (!filters.role || filters.role === "MANAGER") {
        employees.push(...garages
            .filter((g) => g.managerId)
            .map((g) => ({
            userId: g.managerId,
            role: "MANAGER",
            garageId: g.id,
            garageName: g.name,
            employmentStatus: "ACTIVE",
        })));
    }
    // console.log("EMPLOYEES BEFORE AUTH FETCH", employees);
    const users = await Promise.all(employees.map(async (emp) => {
        if (!emp.userId)
            return null;
        try {
            const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${emp.userId}`, {
                headers: {
                    "x-user-id": "resource-service",
                    "x-user-role": "SERVICE",
                },
            });
            return {
                ...emp,
                name: res.data.data.fullname,
                email: res.data.data.email,
                phone: res.data.data.phone,
            };
        }
        catch (err) {
            console.error("AUTH SERVICE ERROR", err);
            return null;
        }
    }));
    const clean = users.filter(Boolean);
    let filtered = clean;
    if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = clean.filter((emp) => emp.name?.toLowerCase().includes(s) ||
            emp.email?.toLowerCase().includes(s) ||
            emp.phone?.toLowerCase().includes(s));
    }
    return {
        data: filtered.slice(skip, skip + limit),
        meta: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
        },
    };
};
exports.getCompanyEmployeesService = getCompanyEmployeesService;
