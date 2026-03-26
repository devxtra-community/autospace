"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyManagerGarageController = exports.updateGarageProfileController = exports.getGaragesByCompanyController = exports.assignManagerController = exports.createGarageController = void 0;
const garage_service_1 = require("../services/garage.service");
const garage2_service_1 = require("../services/garage2.service");
const createGarageController = async (req, res) => {
    console.log("RESOURCE BODY:", req.body);
    try {
        const ownerUserId = req.user.id;
        console.log("user ith", ownerUserId);
        if (!ownerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const garage = await (0, garage_service_1.createGarage)(ownerUserId, req.body);
        return res.status(201).json({
            success: true,
            message: "Garage created successfully. Awaiting approval.",
            data: garage,
        });
    }
    catch (error) {
        if (error.message === "Company not found or not approved" ||
            error.message === "Garage already exists") {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Garage creation failed",
        });
    }
};
exports.createGarageController = createGarageController;
const assignManagerController = async (req, res) => {
    try {
        const ownerUserId = req.user.id;
        const { garageCode, managerId } = req.body;
        if (!ownerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        if (!garageCode || !managerId) {
            return res.status(400).json({
                success: false,
                message: "garageCode and managerId are required",
            });
        }
        const result = await (0, garage2_service_1.assignManagerToGarage)(ownerUserId, garageCode, managerId);
        return res.status(200).json({
            success: true,
            message: "Manager assigned to garage successfully",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.assignManagerController = assignManagerController;
const getGaragesByCompanyController = async (req, res) => {
    try {
        const companyId = Array.isArray(req.params.companyId)
            ? req.params.companyId[0]
            : req.params.companyId;
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;
        const result = await (0, garage2_service_1.getGaragesByCompanyId)(companyId, {
            page,
            limit,
            search,
            status,
        });
        return res.status(200).json({
            success: true,
            message: "Garages fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garages",
        });
    }
};
exports.getGaragesByCompanyController = getGaragesByCompanyController;
const updateGarageProfileController = async (req, res) => {
    try {
        const garageId = req.params.id;
        const { name, contactEmail, contactPhone, valetAvailable, capacity, valetServiceRadius, } = req.body;
        if (!name &&
            !contactEmail &&
            !contactPhone &&
            valetAvailable === undefined &&
            !capacity) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update",
            });
        }
        const garage = await (0, garage_service_1.updateGarageProfile)(garageId, {
            name,
            contactEmail,
            contactPhone,
            valetAvailable,
            capacity,
            valetServiceRadius,
        });
        return res.status(200).json({
            success: true,
            message: "Garage profile updated successfully",
            data: garage,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update garage",
        });
    }
};
exports.updateGarageProfileController = updateGarageProfileController;
const getMyManagerGarageController = async (req, res) => {
    try {
        const managerId = req.user?.id;
        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const garage = await (0, garage_service_1.getMyManagerGarageService)(managerId);
        return res.status(200).json({
            success: true,
            data: garage,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch garage",
        });
    }
};
exports.getMyManagerGarageController = getMyManagerGarageController;
