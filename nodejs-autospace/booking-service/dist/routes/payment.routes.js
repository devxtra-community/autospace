import { Router } from "express";
import { createCheckoutSession } from "../controllers/checkout.controller.js";
const router = Router();
router.post("/create-checkout", createCheckoutSession);
export default router;
//# sourceMappingURL=payment.routes.js.map