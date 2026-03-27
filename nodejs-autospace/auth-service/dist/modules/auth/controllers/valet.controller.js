"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValet = void 0;
const shared_1 = require("@autospace/shared");
const valet_register_service_1 = require("../services/valet-register.service");
const registerValet = async (req, res) => {
    try {
        const parsed = shared_1.ValetRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors,
            });
        }
        const result = await (0, valet_register_service_1.registerValetService)(parsed.data);
        return res.status(201).json({
            success: true,
            message: "Valet registered successfully. Pending approval.",
            data: result,
        });
    }
    catch (error) {
        console.error("Valet register error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Valet registration failed",
        });
    }
};
exports.registerValet = registerValet;
