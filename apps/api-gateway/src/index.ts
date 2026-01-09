// api-gateway/src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.config";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

// Test protected route
app.get("/api/test-auth", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

app.listen(config.port, () => {
  console.log(`API Gateway running on port ${config.port}`);
});
