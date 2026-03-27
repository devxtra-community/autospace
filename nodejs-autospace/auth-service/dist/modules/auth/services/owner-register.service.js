"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLoginStatsService = exports.registerOwner = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const constants_1 = require("../constants");
const data_source_1 = require("../../../db/data-source");
const registerOwner = async (data) => {
    const { fullname, email, phone, password } = data;
    const ownerRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const existing = await ownerRepo.findOne({
        where: [{ email }, { phone }],
    });
    if (existing) {
        throw new Error("Email or Phone already registered");
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = ownerRepo.create({
        fullname,
        email,
        phone,
        password_hash: passwordHash,
        role: constants_1.UserRole.OWNER,
        status: constants_1.UserStatus.ACTIVE,
    });
    const savedUser = await ownerRepo.save(user);
    return {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        created_at: savedUser.created_at,
    };
};
exports.registerOwner = registerOwner;
// admin get user login stats
const getUserLoginStatsService = async () => {
    const repo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const result = await repo
        .createQueryBuilder("user")
        .select("TO_CHAR(user.created_at, 'Mon')", "month")
        .addSelect("COUNT(user.id)", "users")
        .groupBy("month")
        .orderBy("MIN(user.created_at)", "ASC")
        .getRawMany();
    return result;
};
exports.getUserLoginStatsService = getUserLoginStatsService;
