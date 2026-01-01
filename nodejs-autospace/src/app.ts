import express from "express";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { gatewayRouter } from "./gateway";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", gatewayRouter);
app.use(globalErrorHandler);
export default app;
