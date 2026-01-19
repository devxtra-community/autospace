"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production"
        ? ".env.prod"
        : process.env.NODE_ENV === "stage"
            ? ".env.stage"
            : ".env",
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import { authRateLimiter } from "./middleware/rateLimiter.middleware";
const auth_proxy_1 = __importDefault(require("./routes/auth.proxy"));
const healthcheck_1 = require("./utils/healthcheck");
const resource_proxy_1 = __importDefault(require("./routes/resource.proxy"));
const app = (0, express_1.default)();
const port = process.env.GATEWAY_PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// app.use(express.json())
console.log("AUTH_SERVICE_URL =", process.env.AUTH_SERVICE_URL);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
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
app.use("/api", resource_proxy_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
    });
});
app.listen(port, () => {
    console.log(`server running on port ${port}`);
    console.log("the health check on ");
});
exports.default = app;
