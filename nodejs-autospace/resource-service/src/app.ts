import "reflect-metadata";
import express from "express";
import cors from "cors";
import companyRoutes from "./modules/company/routes/company.routes";
import garageRoutes from "./modules/garage/routes/garage.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use((req, _res, next) => {
  console.log("RESOURCE:", req.method, req.originalUrl);
  next();
});

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

export default app;
