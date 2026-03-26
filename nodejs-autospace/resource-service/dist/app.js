"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const requiredEnv = [
    "DATABASE_URL",
    "RABBITMQ_URL",
    "AUTH_SERVICE_URL",
    "INTERNAL_SERVICE_TOKEN",
    "FRONTEND_URL",
];
requiredEnv.forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`Environment variable ${env} is missing`);
    }
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const company_routes_1 = __importDefault(require("./modules/company/routes/company.routes"));
const garage_routes_1 = __importDefault(require("./modules/garage/routes/garage.routes"));
const internal_valet_routes_1 = __importDefault(require("./modules/valets/routes/internal-valet.routes"));
const valet_routes_1 = __importDefault(require("./modules/valets/routes/valet.routes"));
const files_routes_1 = __importDefault(require("./modules/files/files.routes"));
const public_garage_routes_1 = __importDefault(require("./modules/garage/routes/public.garage.routes"));
const internal_garage_routes_1 = __importDefault(require("./modules/garage/routes/internal-garage.routes"));
const internal_slot_routes_1 = __importDefault(require("./modules/garage/routes/internal-slot.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
app.use((req, _res, next) => {
    console.log("RESOURCE RECEIVED:", req.method, req.originalUrl);
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use((req, res, next) => {
    res.setTimeout(10000);
    next();
});
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "resource-service",
    });
});
app.use("/companies", company_routes_1.default);
app.use("/garages", garage_routes_1.default);
app.use("/public", public_garage_routes_1.default);
app.use("/valets", valet_routes_1.default);
app.use("/files", files_routes_1.default);
// auth service only
app.use("/internal/valets", internal_valet_routes_1.default);
app.use("/internal/garages", internal_garage_routes_1.default);
app.use("/internal/slots", internal_slot_routes_1.default);
exports.default = app;
