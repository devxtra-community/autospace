"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompany = void 0;
const company_service_1 = require("../services/company.service");
const registerCompany = async (req, res) => {
    try {
        const ownerUserId = req.headers["x-user-id"];
        if (!ownerUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const company = await (0, company_service_1.createCompany)(ownerUserId, req.body);
        return res.status(201).json({
            success: true,
            message: "Company registered successfully. Awaiting approval.",
            data: company,
        });
    }
    catch (error) {
        if (error.message === "Company already exists") {
            return res.status(409).json({
                success: false,
                message: "Company with this registration number already exists",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Company registration failed",
        });
    }
};
exports.registerCompany = registerCompany;
