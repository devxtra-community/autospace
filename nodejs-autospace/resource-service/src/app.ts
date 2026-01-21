import "reflect-metadata";
import express from "express";
import cors from "cors";
import companyRoutes from "./modules/company/routes/company.routes";
import garageRoutes from "./modules/garage/routes/garage.routes";
import slotsRoutes from "./modules/slots/routes/slot.routes";
import internalValetRoutes from "./modules/valets/routes/internal-valet.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "resource-service",
  });
});

app.use("/companies", companyRoutes);
app.use("/garages", garageRoutes);
app.use("/slots", slotsRoutes);

// auth service only
app.use(internalValetRoutes);

export default app;
