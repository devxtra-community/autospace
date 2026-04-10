import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/booking.routes.js";
import { createHttpLogger } from "@autospace/logger";
import { errorHandler } from "./middleware/error.middleware.js";
import paymentRouter from "./routes/payment.routes.js";
import { stripeWebhookController } from "./controllers/webhook.controller.js";
const app = express();
const httpLogger = createHttpLogger({ service: "booking-service" });
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.post("/payments/webhook", express.raw({ type: "application/json" }), stripeWebhookController);
app.use(express.json());
app.use(httpLogger);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "booking-service" });
});
app.use("/bookings", bookingRoutes);
app.use("/payment", paymentRouter);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map