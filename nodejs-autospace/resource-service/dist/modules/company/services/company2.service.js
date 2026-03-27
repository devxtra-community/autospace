"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyProfile = void 0;
const data_source_1 = require("../../../db/data-source");
const company_entity_1 = require("../entities/company.entity");
const updateCompanyProfile = async (companyId, data) => {
    const repo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const company = await repo.findOne({ where: { id: companyId } });
    if (!company) {
        throw new Error("Company not found");
    }
    if (data.companyName !== undefined)
        company.companyName = data.companyName;
    if (data.contactEmail !== undefined)
        company.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined)
        company.contactPhone = data.contactPhone;
    await repo.save(company);
    return company;
};
exports.updateCompanyProfile = updateCompanyProfile;
