"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyValetController = exports.releaseValetController = exports.getMyAvailabilityController = exports.rejectValetController = exports.approveValetController = void 0;
const valet_service_1 = require("../services/valet.service");
const valetDetail_service_1 = require("../services/valetDetail.service");
const approveValetController = async (req, res) => {
    try {
        const valetId = req.params.id;
        const managerUserId = req.headers["x-user-id"];
        if (!managerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const valet = await (0, valet_service_1.approveValetService)(valetId, managerUserId);
        return res.status(200).json({
            success: true,
            message: "Valet approved successfully",
            data: valet,
        });
    }
    catch (error) {
        if (error.message === "Valet not found" ||
            error.message === "Garage not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message.includes("already") ||
            error.message.includes("not the manager")) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to approve valet",
        });
    }
};
exports.approveValetController = approveValetController;
const rejectValetController = async (req, res) => {
    try {
        const valetId = req.params.id;
        const managerUserId = req.headers["x-user-id"];
        if (!managerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const valet = await (0, valet_service_1.rejectValetService)(valetId, managerUserId);
        return res.status(200).json({
            success: false,
            message: "Valet rejected successfully",
            data: valet,
        });
    }
    catch (error) {
        if (error.message === "Valet not found" ||
            error.message === "Garage not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message.includes("already") ||
            error.message.includes("not the manager")) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to reject valet",
        });
    }
};
exports.rejectValetController = rejectValetController;
const getMyAvailabilityController = async (req, res) => {
    try {
        const valetId = req.headers["x-user-id"];
        if (!valetId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const valetRepo = req.app.get("db").getRepository("valet");
        const valet = await valetRepo.findOne({
            where: { id: valetId },
        });
        if (!valet) {
            return res.status(404).json({
                success: false,
                message: "Valet not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                availabilityStatus: valet.availabilityStatus,
                currentBookingId: valet.currentBookingId,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch availability",
        });
    }
};
exports.getMyAvailabilityController = getMyAvailabilityController;
const releaseValetController = async (req, res) => {
    try {
        const valetId = req.params.valetId;
        const valet = await (0, valet_service_1.releaseValetService)(valetId);
        return res.status(200).json({
            success: true,
            message: "Valet released successfully",
            data: valet,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.releaseValetController = releaseValetController;
const getMyValetController = async (req, res) => {
    try {
        const valetId = req.user?.id;
        if (!valetId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const valet = await (0, valetDetail_service_1.getValetByIdService)(valetId);
        return res.status(200).json({
            success: true,
            message: "My valet profile fetched successfully",
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
            message: "Failed to fetch valet profile",
        });
    }
};
exports.getMyValetController = getMyValetController;
