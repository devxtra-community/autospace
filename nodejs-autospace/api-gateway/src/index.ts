import dotenv from "dotenv";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.prod"
      : process.env.NODE_ENV === "stage"
        ? ".env.stage"
        : ".env",
});

import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";

// import { authRateLimiter } from "./middleware/rateLimiter.middleware";
import authRouter from "./routes/auth.proxy";
import { checkAllServices } from "./utils/healthcheck";
import resourceRouter from "./routes/resource.proxy";

const app = express();
const port = process.env.GATEWAY_PORT || 4000;

app.use(helmet());

// app.use(express.json())

console.log("AUTH_SERVICE_URL =", process.env.AUTH_SERVICE_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/services", async (req, res) => {
  const services = await checkAllServices();
  const allUp = services.every((s) => s.status === "up");

  res.status(allUp ? 200 : 503).json({
    gateway: "ok",
    services,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/companies", resourceRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
  console.log("the health check on ");
});

export default app;
