"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./env.config");
const jwtconfig = {
    accessToken: {
        secret: env_config_1.env.JWT_ACCESS_SECRET || "secret-key-access",
        expiresIn: env_config_1.env.JWT_ACCESS_EXPIRY || "15m",
    },
    refreshToken: {
        secret: env_config_1.env.JWT_REFRESH_SECRET || "secret-key-refresh",
        expiresIn: env_config_1.env.JWT_REFRESH_EXPIRY || "7d",
    },
};
exports.default = jwtconfig;
