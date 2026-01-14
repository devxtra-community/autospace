"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceUrl = exports.servicesConfig = void 0;
// api-gateway/src/config/services.config.ts
exports.servicesConfig = {
    auth: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
        healthEndpoint: "/health",
    },
    booking: {
        url: process.env.BOOKING_SERVICE_URL || "http://localhost:4002",
        healthEndpoint: "/health",
    },
    resource: {
        url: process.env.RESOURCE_SERVICE_URL || "http://localhost:4003",
        healthEndpoint: "/health",
    },
};
const getServiceUrl = (serviceName) => {
    return exports.servicesConfig[serviceName].url;
};
exports.getServiceUrl = getServiceUrl;
