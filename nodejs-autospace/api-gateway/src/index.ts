import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
// import { authRateLimiter } from "./middleware/rateLimiter.middleware";
import authRouter from "./routes/auth.proxy";
import { checkAllServices } from "./utils/healthcheck";
import resourceRouter from "./routes/resource.proxy";
import { createLogger, createHttpLogger } from "@autospace/logger";
import bookingRouter from "./routes/booking.proxy";

const app = express();

const logger = createLogger({ service: "api-gateway" });
const httpLogger = createHttpLogger({ service: "api-gateway" });

app.use(httpLogger);

const port = process.env.GATEWAY_PORT || 4000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-role"],
  }),
);

// in local commend that here change on lacal

// const allowedOrigins = [
//   "https://autospace.space",
//   "https://www.autospace.space",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, origin);
//       }

//       logger.warn(`Blocked by CORS: ${origin}`);
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   }),
// );

logger.info(`AUTH_SERVICE_URL = ${process.env.AUTH_SERVICE_URL}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/debug-cookies", (req, res) => {
  res.json(req.cookies);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/services", async (req, res) => {
  const services = await checkAllServices();
  const allUp = services.every((s) => s.status === "up");

  res.status(allUp ? 200 : 503).json({
    gateway: "ok",
    services,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);

app.use("/api", resourceRouter, bookingRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  logger.info(`server running on port ${port}`);
  logger.info("the health check on ");
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("Unhandled error", {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;
