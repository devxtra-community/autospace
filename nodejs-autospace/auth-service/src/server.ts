import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const requiredEnv = [
  "DATABASE_URL",
  "REDIS_URL",
  "RESOURCE_SERVICE_URL",
  "INTERNAL_SERVICE_TOKEN",
  "FRONTEND_URL",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} is missing`);
  }
});

import app from "./app";
import { AppDataSource } from "./db/data-source";
import { connectRedis } from "./config/redis";

const startServer = async () => {
  try {
    // TypeORM connection
    await AppDataSource.initialize();
    console.log("Database connected");

    await connectRedis();
    console.log("Redis connected");

    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();
