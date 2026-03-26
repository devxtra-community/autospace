"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseValetController = exports.getAllActiveValetsController = exports.rejectBookingController = exports.assignValetController = exports.getAvailableValetController = exports.registerValet = exports.resolveGarage = void 0;
const axios_1 = __importDefault(require("axios"));
const resolve_garage_service_1 = require("../services/resolve-garage.service");
const valet_register_service_1 = require("../services/valet-register.service");
const valet_service_1 = require("../services/valet.service");
const resolveGarage = async (req, res) => {
    try {
        const result = await (0, resolve_garage_service_1.resolveGarageService)(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Failed to resolve garage",
        });
    }
};
exports.resolveGarage = resolveGarage;
const registerValet = async (req, res) => {
    try {
        const result = await (0, valet_register_service_1.registerValetService)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Failed to register valet",
        });
    }
};
exports.registerValet = registerValet;
const getAvailableValetController = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        const exclude = req.query.exclude;
        const excludeIds = exclude ? exclude.split(",") : [];
        const valet = await (0, valet_service_1.getAvailableValetService)(garageId, excludeIds);
        return res.status(200).json({
            success: true,
            data: valet || null,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch available valet",
        });
    }
};
exports.getAvailableValetController = getAvailableValetController;
const assignValetController = async (req, res) => {
    try {
        const valetId = req.params.valetId;
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "bookingId required",
            });
        }
        // STEP 1: Ask booking-service to assign valet FIRST
        await axios_1.default.patch(`${process.env.BOOKING_SERVICE_URL}/bookings/internal/${bookingId}/assign`, { valetId }, {
            headers: {
                "x-user-id": valetId,
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        });
        // STEP 2: ONLY if booking-service succeeds → mark valet busy
        const valet = await (0, valet_service_1.markValetBusyService)(valetId, bookingId);
        return res.status(200).json({
            success: true,
            data: valet,
        });
    }
    catch (error) {
        console.error("Assign valet error:", error.response?.data || error.message);
        return res.status(400).json({
            success: false,
            message: error.response?.data?.message || error.message,
        });
    }
};
exports.assignValetController = assignValetController;
const rejectBookingController = async (req, res) => {
    try {
        const valetId = req.params.valetId;
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "bookingId required",
            });
        }
        // STEP 1: tell booking-service to reject
        await axios_1.default.patch(`${process.env.BOOKING_SERVICE_URL}/bookings/internal/${bookingId}/reject`, { valetId }, {
            headers: {
                "x-user-id": valetId,
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        });
        return res.status(200).json({
            success: true,
            message: "Booking rejected successfully",
        });
    }
    catch (error) {
        console.error("Reject valet error:", error.response?.data || error.message);
        return res.status(400).json({
            success: false,
            message: error.response?.data?.message || error.message,
        });
    }
};
exports.rejectBookingController = rejectBookingController;
const getAllActiveValetsController = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        if (!garageId) {
            return res.status(400).json({
                success: false,
                message: "garageId required",
            });
        }
        const valets = await (0, valet_service_1.getAllActiveValetsService)(garageId);
        return res.status(200).json({
            success: true,
            data: valets,
        });
    }
    catch (error) {
        console.error("Get active valets error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch active valets",
        });
    }
};
exports.getAllActiveValetsController = getAllActiveValetsController;
const releaseValetController = async (req, res) => {
    try {
        const valetId = req.params.valetId;
        const valet = await (0, valet_service_1.releaseValetService)(valetId);
        return res.status(200).json({
            success: true,
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
