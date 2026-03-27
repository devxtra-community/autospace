"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getAllUsersService = exports.updateUserProfile = exports.getUserProfile = exports.protectedRoute = void 0;
// import { FindOptionsWhere } from "typeorm";
// test route of protected router //
const protectedRoute = (req, res) => {
    res.json({
        success: true,
        message: "Authenticated successfully",
        user: req.user,
    });
};
exports.protectedRoute = protectedRoute;
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const redis_1 = __importDefault(require("../../../config/redis"));
const repo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
const getUserProfile = async (userId) => {
    const cacheKey = `user:${userId}`;
    // Check Redis
    const cached = await redis_1.default.get(cacheKey);
    if (cached) {
        console.log("User from Redis");
        return JSON.parse(cached);
    }
    const user = await repo.findOne({
        where: { id: userId },
        select: [
            "id",
            "fullname",
            "email",
            "phone",
            "role",
            "status",
            "created_at",
            "companyId",
        ],
    });
    if (!user)
        throw new Error("User not found");
    const result = {
        id: user.id,
        name: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        createdAt: user.created_at,
    };
    // Store in Redis (10 min)
    await redis_1.default.set(cacheKey, JSON.stringify(result), { EX: 600 });
    return result;
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const user = await repo.findOne({ where: { id: userId } });
    if (!user)
        throw new Error("User not found");
    if (data.name !== undefined)
        user.fullname = data.name;
    if (data.email !== undefined)
        user.email = data.email;
    if (data.phone !== undefined)
        user.phone = data.phone;
    await repo.save(user);
    await redis_1.default.del(`user:${userId}`);
    return {
        id: user.id,
        name: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
};
exports.updateUserProfile = updateUserProfile;
const getAllUsersService = async (filters) => {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const qb = repo.createQueryBuilder("user");
    qb.select([
        "user.id",
        "user.fullname",
        "user.email",
        "user.phone",
        "user.status",
        "user.role",
        "user.created_at",
    ]);
    /* SEARCH */
    if (filters.search) {
        qb.andWhere(`(user.fullname ILIKE :search
     OR user.email ILIKE :search
     OR user.phone ILIKE :search)`, { search: `%${filters.search}%` });
    }
    /* ROLE */
    if (filters.role) {
        qb.andWhere("user.role = :role", {
            role: filters.role,
        });
    }
    /* STATUS */
    if (filters.status) {
        qb.andWhere("user.status = :status", {
            status: filters.status,
        });
    }
    /* PAGINATION */
    qb.orderBy("user.created_at", "DESC").skip(skip).take(limit);
    const [users, total] = await qb.getManyAndCount();
    return {
        data: users.map((u) => ({
            userId: u.id,
            fullname: u.fullname,
            email: u.email,
            phone: u.phone,
            dateJoined: u.created_at,
            status: u.status,
            role: u.role,
        })),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllUsersService = getAllUsersService;
const updateUserStatus = async (userId, status) => {
    console.log("TYPE:", typeof status);
    console.log("VALUE:", JSON.stringify(status));
    const normalizedStatus = status?.trim().toLowerCase();
    if (!["active", "rejected"].includes(normalizedStatus)) {
        throw new Error("Invalid status value");
    }
    const user = await repo.findOne({ where: { id: userId } });
    if (!user)
        throw new Error("User not found");
    user.status = normalizedStatus;
    const updatedUser = await repo.save(user);
    return {
        success: true,
        data: updatedUser,
    };
};
exports.updateUserStatus = updateUserStatus;
