"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./db/data-source");
const redis_1 = require("./config/redis");
const startServer = async () => {
    try {
        // TypeORM connection
        await data_source_1.AppDataSource.initialize();
        console.log("Database connected");
        await (0, redis_1.connectRedis)();
        console.log("Redis connected");
        const PORT = process.env.PORT || 4001;
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};
startServer();
