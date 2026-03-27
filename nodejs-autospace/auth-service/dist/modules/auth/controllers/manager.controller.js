"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignableManagers = exports.assignManagerInternal = exports.getManagerInternal = exports.managerSignup = void 0;
const manager_register_service_1 = require("../services/manager-register.service");
const data_source_1 = require("../../../db/data-source");
const user_entity_1 = require("../entities/user.entity");
const constants_1 = require("../constants");
const manager_state_enum_1 = require("../constants/manager-state.enum");
const managerSignup = async (req, res) => {
    try {
        const manager = await (0, manager_register_service_1.registerManager)(req.body);
        return res.status(201).json({
            success: true,
            message: "Manager registered successfully",
            data: manager,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.managerSignup = managerSignup;
const getManagerInternal = async (req, res) => {
    const id = req.params.id;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const manager = await userRepo.findOne({ where: { id } });
    if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
    }
    return res.json({
        id: manager.id,
        fullname: manager.fullname,
        email: manager.email,
        role: manager.role,
        companyId: manager.companyId,
        managerState: manager.managerState,
    });
};
exports.getManagerInternal = getManagerInternal;
const assignManagerInternal = async (req, res) => {
    const id = req.params.id;
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const manager = await userRepo.findOne({ where: { id } });
    if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
    }
    if (manager.role !== constants_1.UserRole.MANAGER) {
        return res.status(400).json({ message: "User is not a manager" });
    }
    manager.managerState = manager_state_enum_1.ManagerState.ASSIGNED;
    await userRepo.save(manager);
    return res.json({ success: true });
};
exports.assignManagerInternal = assignManagerInternal;
const getAssignableManagers = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
        const managers = await userRepo.find({
            where: {
                companyId,
                role: constants_1.UserRole.MANAGER,
                status: constants_1.UserStatus.ACTIVE,
                managerState: manager_state_enum_1.ManagerState.UNASSIGNED,
            },
            select: ["id", "fullname", "email"],
        });
        return res.status(200).json({
            success: true,
            data: managers,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch managers",
        });
    }
};
exports.getAssignableManagers = getAssignableManagers;
