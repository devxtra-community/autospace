import "reflect-metadata";
import express from "express";
import cors from "cors";
import companyRoutes from "./modules/company/routes/company.routes";
import garageRoutes from "./modules/garage/routes/garage.routes";
import internalValetRoutes from "./modules/valets/routes/internal-valet.routes";
import valetRoutes from "./modules/valets/routes/valet.routes";
import filesRoutes from "./modules/files/files.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);

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
app.use("/valet", valetRoutes);
app.use("/files", filesRoutes);

// auth service only
app.use(internalValetRoutes);

export default app;
