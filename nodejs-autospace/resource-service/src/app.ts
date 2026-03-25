import "reflect-metadata";
import "dotenv/config";

const requiredEnv = [
  "DATABASE_URL",
  "RABBITMQ_URL",
  "AUTH_SERVICE_URL",
  "INTERNAL_SERVICE_TOKEN",
  "FRONTEND_URL",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} is missing`);
  }
});
import express from "express";
import cors from "cors";
import companyRoutes from "./modules/company/routes/company.routes";
import garageRoutes from "./modules/garage/routes/garage.routes";
import internalValetRoutes from "./modules/valets/routes/internal-valet.routes";
import valetRoutes from "./modules/valets/routes/valet.routes";
import filesRoutes from "./modules/files/files.routes";
import publicRoutes from "./modules/garage/routes/public.garage.routes";
import internalGarageRoutes from "./modules/garage/routes/internal-garage.routes";
import internalSlotRoutes from "./modules/garage/routes/internal-slot.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);

app.use((req, _res, next) => {
  console.log("RESOURCE RECEIVED:", req.method, req.originalUrl);
  next();
});

app.use(express.json());
app.use(express.urlencoded());

app.use((req, res, next) => {
  res.setTimeout(10000);
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "resource-service",
  });
});

app.use("/companies", companyRoutes);
app.use("/garages", garageRoutes);
app.use("/public", publicRoutes);
app.use("/valets", valetRoutes);
app.use("/files", filesRoutes);

// auth service only
app.use("/internal/valets", internalValetRoutes);
app.use("/internal/garages", internalGarageRoutes);
app.use("/internal/slots", internalSlotRoutes);

export default app;
