"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerManager = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const constants_1 = require("../constants");
const manager_state_enum_1 = require("../constants/manager-state.enum");
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL;
const registerManager = async (data) => {
    const { fullname, email, phone, password, businessRegistrationNumber } = data;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    let companyId;
    try {
        const response = await axios_1.default.get(`${RESOURCE_SERVICE_URL}/companies/internal/brn/${businessRegistrationNumber}/validate`, { timeout: 3000 });
        if (!response.data.valid) {
            throw new Error("Invalid or inactive company");
        }
        companyId = response.data.companyId;
    }
    catch (err) {
        throw err;
    }
    const existing = await userRepo.findOne({
        where: [{ email }, { phone }],
    });
    if (existing) {
        throw new Error("Email or phone already registered");
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const manager = userRepo.create({
        fullname,
        email,
        phone,
        password_hash: passwordHash,
        role: constants_1.UserRole.MANAGER,
        status: constants_1.UserStatus.ACTIVE,
        companyId,
        managerState: manager_state_enum_1.ManagerState.UNASSIGNED,
    });
    const saved = await userRepo.save(manager);
    return {
        id: saved.id,
        fullname: saved.fullname,
        email: saved.email,
        role: saved.role,
        status: saved.status,
        companyId: saved.companyId,
        managerState: saved.managerState,
        createdAt: saved.created_at,
    };
};
exports.registerManager = registerManager;
