import "reflect-metadata";
import express from "express";
import cors from "cors";
import companyRoutes from "./modules/company/routes/company.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "resource-service",
  });
});

app.use("/companies", companyRoutes);

export default app;
