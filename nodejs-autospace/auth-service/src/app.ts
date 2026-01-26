import express from "express";
import { globalErrorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ownerRoutes, authRoutes, managerRoutes } from "./modules/auth";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/owner", ownerRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api", authRoutes);
app.use(globalErrorHandler);
export default app;
