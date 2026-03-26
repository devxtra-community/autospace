"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGaragesController = exports.getGarageByIdController = exports.unblockGarage = exports.blockGarage = exports.rejectGarage = exports.approveGarage = exports.getPendingGarages = void 0;
const garage_entity_1 = require("../entities/garage.entity");
const garage_service_1 = require("../services/garage.service");
const garage2_service_1 = require("../services/garage2.service");
const getPendingGarages = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters",
            });
        }
        const result = await (0, garage_service_1.getGarageByStatus)(garage_entity_1.GarageStatus.PENDING, page, limit);
        return res.status(200).json({
            success: true,
            message: "Pending garages fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        console.error("Get pending garages failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending garages",
        });
    }
};
exports.getPendingGarages = getPendingGarages;
const approveGarage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const garage = await (0, garage_service_1.updateGarageStatus)(id, garage_entity_1.GarageStatus.ACTIVE, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Garage approved successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to approve garage",
        });
    }
};
exports.approveGarage = approveGarage;
const rejectGarage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const garage = await (0, garage_service_1.updateGarageStatus)(id, garage_entity_1.GarageStatus.REJECTED, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Garage rejected successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to reject garage",
        });
    }
};
exports.rejectGarage = rejectGarage;
const blockGarage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const garage = await (0, garage_service_1.updateGarageStatus)(id, garage_entity_1.GarageStatus.BLOCKED, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Garage blocked successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to block garage",
        });
    }
};
exports.blockGarage = blockGarage;
const unblockGarage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const garage = await (0, garage_service_1.updateGarageStatus)(id, garage_entity_1.GarageStatus.ACTIVE, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Garage unblocked successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to unblock garage",
        });
    }
};
exports.unblockGarage = unblockGarage;
const getGarageByIdController = async (req, res) => {
    try {
        const garageId = req.params.id;
        const garage = await (0, garage2_service_1.getGarageById)(garageId);
        return res.status(200).json({
            success: true,
            message: "Garage fetched successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Garage not found",
        });
    }
};
exports.getGarageByIdController = getGarageByIdController;
const getAllGaragesController = async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;
        const result = await (0, garage2_service_1.getAllGarages)(page, limit, search, status);
        return res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garages",
        });
    }
};
exports.getAllGaragesController = getAllGaragesController;
