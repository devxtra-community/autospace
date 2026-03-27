"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyEmployeesController = void 0;
const companyEmployee_service_1 = require("../services/companyEmployee.service");
const getCompanyEmployeesController = async (req, res) => {
    try {
        /* ================= FIX companyId TYPE ================= */
        const companyIdParam = req.params.companyId ?? req.user?.companyId;
        const companyId = typeof companyIdParam === "string"
            ? companyIdParam
            : Array.isArray(companyIdParam)
                ? companyIdParam[0]
                : undefined;
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "companyId required",
            });
        }
        /* ================= FIX QUERY TYPES ================= */
        const page = typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
        const role = typeof req.query.role === "string" ? req.query.role : undefined;
        const employmentStatus = typeof req.query.employmentStatus === "string"
            ? req.query.employmentStatus
            : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        // console.log("company",companyId);
        const result = await (0, companyEmployee_service_1.getCompanyEmployeesService)(companyId, {
            page,
            limit,
            role: role,
            employmentStatus,
            search,
        });
        return res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("getCompanyEmployeesController error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch company employees",
        });
    }
};
exports.getCompanyEmployeesController = getCompanyEmployeesController;
