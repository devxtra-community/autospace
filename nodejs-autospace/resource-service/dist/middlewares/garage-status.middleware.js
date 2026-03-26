"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveGarage = void 0;
const data_source_1 = require("../db/data-source");
const garage_entity_1 = require("../modules/garage/entities/garage.entity");
const valets_entity_1 = require("../modules/valets/entities/valets.entity");
const auth_type_1 = require("../types/auth.type");
const requireActiveGarage = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next();
        // Only apply to managers and valets
        if (user.role !== auth_type_1.UserRole.MANAGER && user.role !== auth_type_1.UserRole.VALET) {
            return next();
        }
        const garageRepo = data_source_1.AppDataSource.getRepository(garage_entity_1.Garage);
        let garage = null;
        if (user.role === auth_type_1.UserRole.MANAGER) {
            garage = await garageRepo.findOne({ where: { managerId: user.id } });
        }
        else if (user.role === auth_type_1.UserRole.VALET) {
            const valetRepo = data_source_1.AppDataSource.getRepository(valets_entity_1.Valet);
            const valet = await valetRepo.findOne({ where: { id: user.id } });
            if (valet) {
                garage = await garageRepo.findOne({ where: { id: valet.garageId } });
            }
        }
        if (garage && garage.status === garage_entity_1.GarageStatus.BLOCKED) {
            return res.status(403).json({
                success: false,
                message: "Garage blocked by authority",
            });
        }
        next();
    }
    catch (error) {
        console.error("Garage status check failed:", error);
        // Continue processing on error so we don't accidentally block legitimate requests if there's a DB blip
        next();
    }
};
exports.requireActiveGarage = requireActiveGarage;
