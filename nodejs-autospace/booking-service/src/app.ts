import express from "express";
import cors from "cors";
import type { Express } from "express";
import bookingRoutes from "./routes/booking.routes.js";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "booking-service" });
});

app.use("/bookings", bookingRoutes);
app.use(errorHandler);

export default app;
