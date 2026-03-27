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
const rabbitmq_1 = require("./config/rabbitmq");
const start = async () => {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connected");
        await (0, redis_1.connectRedis)();
        console.log("Redis connected");
        await (0, rabbitmq_1.initRabbit)();
        console.log("RabbitMQ connected");
        await (0, rabbitmq_1.startValetConsumer)();
        console.log("Valet consumer started");
        const PORT = process.env.PORT || 4003;
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};
start();
