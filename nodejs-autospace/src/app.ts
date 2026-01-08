import express from "express";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { gatewayRouter } from "./gateway";
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

app.use("/api", gatewayRouter);
app.use(globalErrorHandler);
export default app;
