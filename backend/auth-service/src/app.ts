import express from "express";
import { globalErrorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/routes/auth.routes";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use(globalErrorHandler);
export default app;
