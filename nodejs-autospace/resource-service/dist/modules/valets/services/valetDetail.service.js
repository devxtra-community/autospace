"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingValetsService = exports.getValetByIdService = exports.getCompanyValetsService = void 0;
const data_source_1 = require("../../../db/data-source");
const valets_entity_1 = require("../entities/valets.entity");
const valet_service_1 = require("./valet.service");
// Get all company valets (for owner)
const getCompanyValetsService = async (companyId, 
//   ownerUserId: string,
filters) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    // Note: You might want to verify ownerUserId owns this company
    // For now, assuming gateway already validated this
    // Build query
    const where = { companyId };
    if (filters.status) {
        where.employmentStatus = filters.status;
    }
    const skip = (filters.page - 1) * filters.limit;
    const [data, total] = await valetRepo.findAndCount({
        where,
        skip,
        take: filters.limit,
        order: { createdAt: "DESC" },
    });
    return {
        data,
        meta: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
        },
    };
};
exports.getCompanyValetsService = getCompanyValetsService;
// Get valet by ID
const getValetByIdService = async (valetId) => {
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const valet = await valetRepo.findOne({
        where: { id: valetId },
    });
    if (!valet) {
        throw new Error("Valet not found");
    }
    return valet;
};
exports.getValetByIdService = getValetByIdService;
// Get pending valets for a garage (manager)
const getPendingValetsService = async (garageId, managerUserId, page = 1, limit = 10) => {
    return await (0, valet_service_1.getValetsByGarageService)(garageId, managerUserId, {
        employmentStatus: valets_entity_1.ValetEmployementStatus.PENDING,
        page,
        limit,
    });
};
exports.getPendingValetsService = getPendingValetsService;
