"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
console.log("CWD =", process.cwd());
console.log("__dirname =", __dirname);
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.NODE_ENV === "production"
    ? ".env.prod"
    : process.env.NODE_ENV === "stage"
        ? ".env.stage"
        : ".env";
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, `../../${envFile}`),
});
exports.env = {
    PORT: process.env.PORT || 4002,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
};
