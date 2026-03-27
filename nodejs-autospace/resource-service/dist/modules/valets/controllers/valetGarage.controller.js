"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableValetForUser = exports.getPendingValetsController = exports.getValetByIdController = exports.getCompanyValetsController = exports.getValetsByGarageController = void 0;
const valet_service_1 = require("../services/valet.service");
const valetDetail_service_1 = require("../services/valetDetail.service");
// export const approveValetController
// Get valets by garage
const getValetsByGarageController = async (req, res) => {
    const garageIdParam = req.params.garageId;
    const garageId = Array.isArray(garageIdParam)
        ? garageIdParam[0]
        : garageIdParam;
    const managerUserId = req.user?.id;
    if (!managerUserId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    if (!garageId) {
        return res.status(400).json({
            success: false,
            message: "GarageId required",
        });
    }
    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const employmentStatus = typeof req.query.employmentStatus === "string"
        ? req.query.employmentStatus
        : undefined;
    const availabilityStatus = typeof req.query.availabilityStatus === "string"
        ? req.query.availabilityStatus
        : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await (0, valet_service_1.getValetsByGarageService)(garageId, managerUserId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        employmentStatus: req.query.employmentStatus,
        availabilityStatus: req.query.availabilityStatus,
        search: req.query.search,
    });
    return res.json({
        success: true,
        data: result.data,
        meta: result.meta,
    });
};
exports.getValetsByGarageController = getValetsByGarageController;
// Get company valets (for owner)
const getCompanyValetsController = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const ownerUserId = req.headers["x-user-id"];
        const { status, page, limit } = req.query;
        if (!ownerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await (0, valetDetail_service_1.getCompanyValetsService)(companyId, {
            status: status,
            page,
            limit,
        });
        return res.status(200).json({
            success: true,
            message: "Company valets fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch company valets",
        });
    }
};
exports.getCompanyValetsController = getCompanyValetsController;
// Get valet by ID
const getValetByIdController = async (req, res) => {
    try {
        const valetId = req.params.id;
        const valet = await (0, valetDetail_service_1.getValetByIdService)(valetId);
        return res.status(200).json({
            success: true,
            message: "Valet fetched successfully",
            data: valet,
        });
    }
    catch (error) {
        if (error.message === "Valet not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch valet",
        });
    }
};
exports.getValetByIdController = getValetByIdController;
// Get pending valets for manager
const getPendingValetsController = async (req, res) => {
    try {
        const garageId = req.query.garageId;
        const managerUserId = req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!garageId) {
            return res.status(400).json({
                success: false,
                message: "garageId is required",
            });
        }
        if (!managerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await (0, valetDetail_service_1.getPendingValetsService)(garageId, managerUserId, page, limit);
        return res.status(200).json({
            success: true,
            message: "Pending valets fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        if (error.message === "Garage not found" ||
            error.message.includes("not the manager")) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending valets",
        });
    }
};
exports.getPendingValetsController = getPendingValetsController;
const getAvailableValetForUser = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        const valet = await (0, valet_service_1.getAvailableValetService)(garageId);
        return res.status(200).json({
            success: true,
            available: !!valet,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to check valet availability",
        });
    }
};
exports.getAvailableValetForUser = getAvailableValetForUser;
