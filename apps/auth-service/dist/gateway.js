"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayRouter = void 0;
const express_1 = require("express");
exports.gatewayRouter = (0, express_1.Router)();
exports.gatewayRouter.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
