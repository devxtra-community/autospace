"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = void 0;
const rbac = (...allowedRoles) => (req, res, next) => {
    const user = req.user; // set by auth middleware
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(user.role)) {
        return res
            .status(403)
            .json({ message: "Access denied: insufficient Permissions" });
    }
    next();
};
exports.rbac = rbac;
