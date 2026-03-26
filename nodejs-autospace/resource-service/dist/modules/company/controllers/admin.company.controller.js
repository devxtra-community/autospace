"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCompany = exports.approveCompany = exports.getPendingCompanies = void 0;
const company_entity_1 = require("../entities/company.entity");
const company_service_1 = require("../services/company.service");
const getPendingCompanies = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters",
            });
        }
        const result = await (0, company_service_1.getCompanyByStatus)(company_entity_1.CompanyStatus.PENDING, page, limit);
        return res.status(200).json({
            success: true,
            message: "Pending companies fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        console.error("Get pending companies failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending companies",
        });
    }
};
exports.getPendingCompanies = getPendingCompanies;
const approveCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const company = await (0, company_service_1.updateCompanyStatus)(id, company_entity_1.CompanyStatus.ACTIVE, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Company approved successfully",
            data: company,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to approve company",
        });
    }
};
exports.approveCompany = approveCompany;
const rejectCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const adminUserId = req.user.id;
        const company = await (0, company_service_1.updateCompanyStatus)(id, company_entity_1.CompanyStatus.REJECTED, adminUserId);
        return res.status(200).json({
            success: true,
            message: "Company rejected successfully",
            data: company,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to reject company",
        });
    }
};
exports.rejectCompany = rejectCompany;
