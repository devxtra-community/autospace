"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import { authRateLimiter } from "./middleware/rateLimiter.middleware";
const auth_proxy_1 = __importDefault(require("./routes/auth.proxy"));
const healthcheck_1 = require("./utils/healthcheck");
const resource_proxy_1 = __importDefault(require("./routes/resource.proxy"));
const logger_1 = require("@autospace/logger");
const booking_proxy_1 = __importDefault(require("./routes/booking.proxy"));
const app = (0, express_1.default)();
const logger = (0, logger_1.createLogger)({ service: "api-gateway" });
const httpLogger = (0, logger_1.createHttpLogger)({ service: "api-gateway" });
app.use(httpLogger);
const port = process.env.GATEWAY_PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-role"],
}));
// in local commend that here change on lacal
// const allowedOrigins = [
//   "https://autospace.space",
//   "https://www.autospace.space",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, origin);
//       }
//       logger.warn(`Blocked by CORS: ${origin}`);
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   }),
// );
logger.info(`AUTH_SERVICE_URL = ${process.env.AUTH_SERVICE_URL}`);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get("/debug-cookies", (req, res) => {
    res.json(req.cookies);
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "api-gateway",
        timestamp: new Date().toISOString(),
    });
});
app.get("/health/services", async (req, res) => {
    const services = await (0, healthcheck_1.checkAllServices)();
    const allUp = services.every((s) => s.status === "up");
    res.status(allUp ? 200 : 503).json({
        gateway: "ok",
        services,
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/auth", auth_proxy_1.default);
app.use("/api", resource_proxy_1.default, booking_proxy_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
    });
});
app.listen(port, () => {
    logger.info(`server running on port ${port}`);
    logger.info("the health check on ");
});
app.use((err, req, res, next) => {
    logger.error("Unhandled error", {
        message: err.message,
        stack: err.stack,
        path: req.path,
    });
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
exports.default = app;
