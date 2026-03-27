"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGarageService = void 0;
const data_source_1 = require("../../../db/data-source");
const company_entity_1 = require("../../company/entities/company.entity");
const garage_entity_1 = require("../../garage/entities/garage.entity");
const resolveGarageService = async ({ companyBrn, garageCode, }) => {
    const companyRepo = data_source_1.AppDataSource.getRepository(company_entity_1.Company);
    const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
    const company = await companyRepo.findOne({
        where: { businessRegistrationNumber: companyBrn },
    });
    if (!company) {
        throw new Error("Invalid company BRN");
    }
    const garage = await garageRepo.findOne({
        where: {
            garageRegistrationNumber: garageCode,
            companyId: company.id,
        },
    });
    if (!garage) {
        throw new Error("Invalid garage code for this company");
    }
    return {
        companyId: company.id,
        garageId: garage.id,
    };
};
exports.resolveGarageService = resolveGarageService;
