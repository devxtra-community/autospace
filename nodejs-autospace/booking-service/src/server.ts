import "reflect-metadata";
import express from "express";
import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import { AppDataSource } from "./data-source.js";
import { startPendingExpiryJob } from "./jobs/pendingExpiry.jobs.js";
import { startBookingLifecycleJob } from "./jobs/bookingLifeCycle.job.js";
import { startNoShowExpiryJob } from "./jobs/noShowExpiry.job.js";
import { startValetRequestTimeoutJob } from "./jobs/valetRequestTimeout.job.js";
import { connectRedis } from "./config/redis.js";
import { connectRabbit } from "./config/rabbitmq.js";
import { startValetAssignedConsumer } from "./config/valet.consumer.js";
import { startValetRequestedConsumer } from "./config/valetRequest.Consumer.js";

dotenv.config();

const PORT = process.env.PORT || 4002;

// app.use(express.json());

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("database connected");

    await connectRedis();
    logger.info("redis connected");

    await connectRabbit();
    logger.info("rabbitmq connected");

    await startValetAssignedConsumer();
    logger.info("valet assigned consumer started");
    await startValetRequestedConsumer();

    startPendingExpiryJob();
    startBookingLifecycleJob();
    startNoShowExpiryJob();
    startValetRequestTimeoutJob();

    app.listen(PORT, () => {
      logger.info(`Booking service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
