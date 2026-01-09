import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { authRateLimiter } from "./middleware/rateLimiter.middleware";

const app = express();
const port = process.env.GATEWAY_PORT || 4000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`server running on port${port}`);
  console.log("the health check on ");
});

export default app;
