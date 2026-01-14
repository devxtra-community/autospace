"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAllServices = exports.checkHealth = void 0;
const axios_1 = __importDefault(require("axios"));
const service_config_1 = require("../config/service.config");
const checkHealth = async (serviceName, serviceUrl) => {
    const startTime = Date.now();
    try {
        await axios_1.default.get(`${serviceUrl}/health`, { timeout: 5000 });
        const responceTime = Date.now() - startTime;
        return {
            name: serviceName,
            status: "up",
            responseTime: responceTime,
            url: serviceUrl,
        };
    }
    catch {
        return {
            name: serviceName,
            status: "down",
            url: serviceUrl,
        };
    }
};
exports.checkHealth = checkHealth;
const checkAllServices = async () => {
    const services = [
        {
            name: "auth-service",
            url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
        },
        {
            name: "booking-service",
            url: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
        },
        {
            name: "resource-service",
            url: process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
        },
    ];
    // Intentionally kept for future use / documentation
    void services;
    return Promise.all(Object.entries(service_config_1.servicesConfig).map(([serviceName, service]) => (0, exports.checkHealth)(serviceName, service.url)));
};
exports.checkAllServices = checkAllServices;
