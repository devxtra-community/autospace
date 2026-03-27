"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const refreshtoken_entity_1 = require("../entities/refreshtoken.entity");
const constants_1 = require("../constants");
const jwt_util_1 = require("../../../utils/jwt.util");
const hash_utils_1 = require("../../../utils/hash.utils");
const loginUser = async (data) => {
    const { email, password } = data;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const refreshRepo = data_source_1.AppDataSource.getRepository(refreshtoken_entity_1.RefreshToken);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isPassword) {
        throw new Error("Invalid credentials");
    }
    if ((user.role === constants_1.UserRole.OWNER ||
        user.role === constants_1.UserRole.MANAGER ||
        user.role === constants_1.UserRole.VALET) &&
        user.status !== "active") {
        throw new Error("User not approved");
    }
    if (user.role === constants_1.UserRole.MANAGER || user.role === constants_1.UserRole.VALET) {
        try {
            // Need dynamic require or import for axios if it wasn't at the top. Let's just import it cleanly.
            // Wait, there's no axios import at top. I'll add the check using a dynamically imported axios or require.
            const axios = require("axios");
            const response = await axios.get(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/users/${user.id}/status`, {
                headers: {
                    "x-user-id": "auth-service",
                    "x-user-role": "SERVICE",
                },
            });
            if (response.data?.data?.status === "blocked") {
                throw new Error("GARAGE_BLOCKED");
            }
        }
        catch (err) {
            if (err.message === "GARAGE_BLOCKED") {
                throw err;
            }
            console.error("Garage status check failed during login:", err.message);
        }
    }
    const tokens = (0, jwt_util_1.generateTokenPair)({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
    });
    await refreshRepo.save({
        token_hash: (0, hash_utils_1.hashToken)(tokens.refreshToken),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user,
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        },
        tokens,
    };
};
exports.loginUser = loginUser;
