"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../modules/auth/entities/user.entity");
const refreshtoken_entity_1 = require("../modules/auth/entities/refreshtoken.entity");
const password_reset_token_entity_1 = require("../modules/auth/entities/password-reset-token.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: false,
    logging: false,
    entities: [user_entity_1.User, refreshtoken_entity_1.RefreshToken, password_reset_token_entity_1.PasswordResetToken],
});
