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
require("dotenv/config");
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./db/data-source");
const start = async () => {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connected");
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
