"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.checkAllServices = exports.checkHealth = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
    catch (error) {
        console.error(`[HealthCheck] ${serviceName} is DOWN → ${serviceUrl}`, error instanceof Error ? error.message : error);
        return {
            name: serviceName,
            status: "down",
            url: serviceUrl,
        };
    }
};
exports.checkHealth = checkHealth;
const checkAllServices = async () => {
    return Promise.all(Object.entries(service_config_1.servicesConfig).map(([serviceName, service]) => (0, exports.checkHealth)(serviceName, service.url)));
};
exports.checkAllServices = checkAllServices;
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later",
        });
    },
});
// add cheyyannam limiting asper project big like password reset limit //
