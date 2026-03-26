"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const constants_1 = require("../constants");
const registerUser = async (data) => {
    const { fullname, email, phone, password, role } = data;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    // Hash password
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    //  Convert string to enum externally
    const userRole = role;
    const status = userRole === constants_1.UserRole.CUSTOMER || userRole === constants_1.UserRole.ADMIN
        ? constants_1.UserStatus.ACTIVE
        : constants_1.UserStatus.PENDING;
    // Create user entity
    const user = userRepo.create({
        fullname,
        email,
        phone,
        password_hash: passwordHash,
        role: userRole,
        status,
    });
    const savedUser = await userRepo.save(user);
    return {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        created_at: savedUser.created_at,
    };
};
exports.registerUser = registerUser;
