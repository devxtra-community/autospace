import "dotenv/config";
import "reflect-metadata";

import app from "./app";
import { AppDataSource } from "./db/data-source";
import { connectRedis } from "./config/redis";
import { initRabbit, startValetConsumer } from "./config/rabbitmq";

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    await connectRedis();
    console.log("Redis connected");

    await initRabbit();
    console.log("RabbitMQ connected");

    await startValetConsumer();
    console.log("Valet consumer started");

    const PORT = process.env.PORT || 4003;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

start();
