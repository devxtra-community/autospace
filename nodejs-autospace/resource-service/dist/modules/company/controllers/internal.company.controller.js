"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCompany = void 0;
const data_source_1 = require("../../../db/data-source");
const company_entity_1 = require("../entities/company.entity");
const validateCompany = async (req, res) => {
    const value = String(req.params.brn).trim().toUpperCase();
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const company = await companyRepo.findOne({
        where: {
            businessRegistrationNumber: value,
            status: company_entity_1.CompanyStatus.ACTIVE,
        },
    });
    if (!company) {
        return res.status(404).json({ valid: false });
    }
    return res.json({
        valid: true,
        companyId: company.id,
        status: company.status,
    });
};
exports.validateCompany = validateCompany;
