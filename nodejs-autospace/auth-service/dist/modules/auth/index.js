"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerRoutes = exports.ownerRoutes = exports.authRoutes = void 0;
var auth_routes_1 = require("./routes/auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var owner_routes_1 = require("./routes/owner.routes");
Object.defineProperty(exports, "ownerRoutes", { enumerable: true, get: function () { return __importDefault(owner_routes_1).default; } });
var manager_routes_1 = require("./routes/manager.routes");
Object.defineProperty(exports, "managerRoutes", { enumerable: true, get: function () { return __importDefault(manager_routes_1).default; } });
