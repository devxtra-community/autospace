"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpLogger = exports.createLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
require("winston-daily-rotate-file");
const createLogger = ({ service }) => {
    const isProd = process.env.NODE_ENV === 'production';
    const logDir = isProd
        ? `/var/log/autospace/${service}`
        : path_1.default.join(process.cwd(), 'logs', service);
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
    return winston_1.default.createLogger({
        level: 'info',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
        defaultMeta: { service },
        transports: [
            new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
            }),
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/error-%DATE%.log`,
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d'
            }),
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/combined-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d'
            })
        ]
    });
};
exports.createLogger = createLogger;
const createHttpLogger = ({ service }) => {
    const logger = (0, exports.createLogger)({ service });
    return (0, morgan_1.default)('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    });
};
exports.createHttpLogger = createHttpLogger;
