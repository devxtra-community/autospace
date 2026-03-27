"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValetService = void 0;
const data_source_1 = require("../../../db/data-source");
const valets_entity_1 = require("../entities/valets.entity");
const valets_entity_2 = require("../entities/valets.entity");
const registerValetService = async ({ userId, companyId, garageId, }) => {
    console.log("INTERNAL VALET REGISTER PAYLOAD:", {
        userId,
        companyId,
        garageId,
    });
    const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
    const exists = await valetRepo.findOne({
        where: { id: userId },
    });
    if (exists) {
        throw new Error("Valet profile already exists");
    }
    const valet = valetRepo.create({
        id: userId,
        companyId,
        garageId,
        employmentStatus: valets_entity_2.ValetEmployementStatus.PENDING,
        availabilityStatus: valets_entity_1.ValetAvailabilityStatus.AVAILABLE,
    });
    return await valetRepo.save(valet);
};
exports.registerValetService = registerValetService;
