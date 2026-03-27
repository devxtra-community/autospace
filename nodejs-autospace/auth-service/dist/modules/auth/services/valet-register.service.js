"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValetService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const constants_1 = require("../constants");
const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL;
const registerValetService = async (data) => {
    const { fullname, email, phone, password, companyBrn, garageCode } = data;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const exists = await userRepo.findOne({
        where: [{ email }, { phone }],
    });
    if (exists) {
        throw new Error("User with this email or phone already exists");
    }
    const { data: resolveData } = await axios_1.default.post(`${RESOURCE_SERVICE_URL}/internal/valets/resolve-garage`, { companyBrn, garageCode });
    const { companyId, garageId } = resolveData;
    if (!companyId || !garageId) {
        throw new Error("Invalid company BRN or garage code");
    }
    const password_hash = await bcrypt_1.default.hash(password, 10);
    const user = userRepo.create({
        fullname,
        email,
        phone,
        password_hash,
        role: constants_1.UserRole.VALET,
        status: constants_1.UserStatus.ACTIVE,
        companyId,
        managerState: null,
    });
    const savedUser = await userRepo.save(user);
    try {
        await axios_1.default.post(`${RESOURCE_SERVICE_URL}/internal/valets/register`, {
            userId: savedUser.id,
            companyId,
            garageId,
        });
    }
    catch (err) {
        await userRepo.delete(savedUser.id);
        throw new Error("Valet creation failed, auth user rolled back");
    }
    return {
        id: savedUser.id,
        fullname: savedUser.fullname,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
    };
};
exports.registerValetService = registerValetService;
