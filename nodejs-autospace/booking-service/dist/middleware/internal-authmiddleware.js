import { UserRole, UserStatus } from "../types/auth.type.js";
import { requireActiveGarage } from "./garage-status.middleware.js";
export const internalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    //   Allow INTERNAL service calls
    if (authHeader &&
        authHeader === `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`) {
        return next();
    }
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const email = req.headers["x-user-email"];
    if (!userId || !role) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Missing gateway identity",
        });
    }
    req.user = {
        id: userId,
        role,
        email: email ?? "",
        status: UserStatus.ACTIVE,
    };
    requireActiveGarage(req, res, next);
};
//# sourceMappingURL=internal-authmiddleware.js.map