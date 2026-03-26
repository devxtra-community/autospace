"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = void 0;
const data_source_1 = require("../../../db/data-source");
const company_entity_1 = require("../entities/company.entity");
const createCompany = async (ownerUserId, data) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const existing = await companyRepo.findOne({
        where: { businessRegistrationNumber: data.businessRegistrationNumber },
    });
    if (existing) {
        throw new Error("Company already exists");
    }
    const company = companyRepo.create({
        ownerUserId,
        companyName: data.companyName,
        businessRegistrationNumber: data.businessRegistrationNumber,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        businessLocation: data.businessLocation,
        status: company_entity_1.CompanyStatus.PENDING,
    });
    return await companyRepo.save(company);
};
exports.createCompany = createCompany;
