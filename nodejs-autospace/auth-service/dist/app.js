"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middlewares/errorHandler");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./modules/auth");
const internal_user_routes_1 = __importDefault(require("./modules/auth/routes/internal-user.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "auth-service",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/owner", auth_1.ownerRoutes);
app.use("/api/manager", auth_1.managerRoutes);
app.use("/api", auth_1.authRoutes);
app.use("/internal/users", internal_user_routes_1.default);
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
