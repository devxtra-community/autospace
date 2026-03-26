"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginService = void 0;
const google_auth_library_1 = require("google-auth-library");
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const env_config_1 = require("../../../config/env.config");
const constants_1 = require("../constants");
const jwt_util_1 = require("../../../utils/jwt.util");
const client = new google_auth_library_1.OAuth2Client(env_config_1.env.GOOGLE_CLIENT_ID);
const googleLoginService = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: env_config_1.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
    }
    const email = payload.email;
    const fullname = payload.name;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    let user = await userRepo.findOne({
        where: { email },
    });
    // create user if not exists
    if (!user) {
        user = userRepo.create({
            email,
            fullname: fullname || "Google User",
            role: constants_1.UserRole.CUSTOMER,
            status: constants_1.UserStatus.ACTIVE,
        });
        await userRepo.save(user);
    }
    // allow only customers
    if (user.role !== constants_1.UserRole.CUSTOMER) {
        throw new Error("Google login not allowed for this account");
    }
    // generate tokens
    // generate tokens
    const tokens = {
        accessToken: (0, jwt_util_1.generateAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        }),
        refreshToken: (0, jwt_util_1.generateRefreshToken)({
            id: user.id,
        }),
    };
    return { user, tokens };
};
exports.googleLoginService = googleLoginService;
