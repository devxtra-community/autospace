"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicGarageById = exports.getPublicGarageController = void 0;
const public_garage_service_1 = require("../services/public-garage.service");
const getPublicGarageController = async (req, res) => {
    try {
        // console.log(" CONTROLLER HIT");
        // console.log("RAW QUERY:", req.query);
        // console.log("VALIDATED QUERY:", req.validateQuery);
        const query = req.validateQuery;
        if (!query) {
            return res.status(400).json({ success: false, message: "Invalid query" });
        }
        const latitude = query.lat ? Number(query.lat) : undefined;
        const longitude = query.lng ? Number(query.lng) : undefined;
        console.log("lat and long", latitude, longitude);
        console.log("RAW QUERY:", req.query);
        console.log("VALIDATED QUERY:", req.validateQuery);
        if ((latitude !== undefined && isNaN(latitude)) ||
            (longitude !== undefined && isNaN(longitude))) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude",
            });
        }
        const valetAvailable = query.valetAvailable;
        // let valetAvailable = query.valetAvailable
        console.log("valetavailable", valetAvailable);
        const radius = query.radius ? Number(query.radius) : 25;
        const limit = query.limit ? Number(query.limit) : 10;
        const page = query.page ? Number(query.page) : 1;
        const result = await (0, public_garage_service_1.getPublicGarages)({
            latitude,
            longitude,
            radius,
            valetAvailable,
            limit,
            page,
        });
        return res.status(200).json({
            success: true,
            message: "Garages fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching public garages:", error.message);
        }
        else {
            console.error("Unknown error fetching public garages:", error);
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garages",
        });
    }
};
exports.getPublicGarageController = getPublicGarageController;
const getPublicGarageById = async (req, res) => {
    try {
        const garageId = Array.isArray(req.params.garageId)
            ? req.params.garageId[0]
            : req.params.garageId;
        if (!garageId) {
            return res.status(404).json({
                success: false,
                message: "garageId is wrong or not get",
            });
        }
        const garage = await (0, public_garage_service_1.getGarageByIdService)(garageId);
        if (!garage) {
            return res.status(404).json({
                success: false,
                message: "Garage not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "garge data successfully fetched",
            data: garage,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching public garages:", error.message);
        }
        else {
            console.error("Unknown error fetching public garages:", error);
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch garages",
        });
    }
};
exports.getPublicGarageById = getPublicGarageById;
