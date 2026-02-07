import "reflect-metadata";
import express from "express";
import cors from "cors";
import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import { AppDataSource } from "./data-source.js";

dotenv.config();

const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("database connected");
    // await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Booking service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
