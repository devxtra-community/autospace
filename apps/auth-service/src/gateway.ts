import { Router } from "express";
import authRoutes from "./modules/auth/routes/auth.routes";

export const gatewayRouter = Router();

gatewayRouter.use("/auth", authRoutes);

export default gatewayRouter;
