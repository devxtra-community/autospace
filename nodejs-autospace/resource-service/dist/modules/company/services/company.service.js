"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCompanies = exports.getCompanyById = exports.getCompanyByOwnerId = exports.updateCompanyStatus = exports.getCompanyByStatus = exports.createCompany = void 0;
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("../../../db/data-source");
const company_entity_1 = require("../entities/company.entity");
const garage_entity_1 = require("../../garage/entities/garage.entity");
const typeorm_1 = require("typeorm");
const createCompany = async (ownerUserId, data) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const result = await data_source_1.AppDataSource.query(`SELECT nextval('company_code_seq') AS seq`);
    const seqNumber = result[0].seq;
    const businessRegistrationNumber = `CPY-${String(seqNumber).padStart(4, "0")}`;
    const company = companyRepo.create({
        ownerUserId,
        companyName: data.companyName,
        businessRegistrationNumber,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        businessLocation: data.businessLocation,
        status: company_entity_1.CompanyStatus.PENDING,
    });
    try {
        const saved = await companyRepo.save(company);
        return {
            id: saved.id,
            companyName: saved.companyName,
            businessRegistrationNumber: saved.businessRegistrationNumber,
            status: saved.status,
            createdAt: saved.createdAt,
        };
    }
    catch (err) {
        if (err.code === "23505") {
            throw new Error("Company already exists");
        }
        throw err;
    }
};
exports.createCompany = createCompany;
const getCompanyByStatus = async (status, page = 1, limit = 10) => {
    const repo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
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
exports.getCompanyByStatus = getCompanyByStatus;
const updateCompanyStatus = async (companyId, status, adminUserId) => {
    const repo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const company = await repo.findOne({
        where: { id: companyId },
    });
    if (!company) {
        throw new Error("Company not found");
    }
    if (company.status !== company_entity_1.CompanyStatus.PENDING) {
        throw new Error("Company already processed");
    }
    company.status = status;
    await repo.save(company);
    console.log(`[AUDIT] Admin ${adminUserId} set company ${companyId} to ${status}`);
    return company;
};
exports.updateCompanyStatus = updateCompanyStatus;
const getCompanyByOwnerId = async (ownerUserId) => {
    const repo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const company = await repo.findOne({
        where: {
            ownerUserId: ownerUserId,
        },
    });
    return company;
};
exports.getCompanyByOwnerId = getCompanyByOwnerId;
const getCompanyById = async (id) => {
    const repo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const company = await repo.findOne({
        where: { id },
    });
    if (!company) {
        throw new Error("Company not found");
    }
    return company;
};
exports.getCompanyById = getCompanyById;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const getAllCompanies = async (page = 1, limit = 10, search, status) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const where = {};
    if (search) {
        where.companyName = (0, typeorm_1.ILike)(`%${search}%`);
    }
    if (status) {
        where.status = status.toLowerCase();
    }
    const [companies, total] = await companyRepo.findAndCount({
        where,
        order: { createdAt: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
    });
    const enriched = await Promise.all(companies.map(async (company) => {
        let ownerName = "Unknown";
        try {
            const res = await axios_1.default.get(`${AUTH_SERVICE_URL}/internal/users/${company.ownerUserId}`, {
                headers: {
                    "x-user-id": "resource-service",
                    "x-user-role": "SERVICE",
                },
            });
            ownerName = res.data?.data?.fullname || "Unknown";
        }
        catch (err) {
            console.error("Owner fetch failed:", err);
        }
        const garagesCount = await garageRepo.count({
            where: { companyId: company.id },
        });
        return {
            companyId: company.id,
            companyCode: company.businessRegistrationNumber,
            companyName: company.companyName,
            ownerName,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            businessLocation: company.businessLocation,
            garagesCount,
            status: company.status.toUpperCase(),
            createdAt: company.createdAt,
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
exports.getAllCompanies = getAllCompanies;
