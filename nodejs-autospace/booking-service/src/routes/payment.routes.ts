import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { createCheckoutSession } from "../controllers/checkout.controller.js";

const router: ExpressRouter = Router();

router.post("/create-checkout", createCheckoutSession);

export default router;
