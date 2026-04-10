import amqp from "amqplib";
import { logger } from "../utils/logger.js";

let channel: amqp.Channel;

export const connectRabbit = async () => {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error("RABBITMQ_URL is not defined");
  }

  let retries = 5;

  while (retries) {
    try {
      const connection = await amqp.connect(url);

      connection.on("error", (err) => {
        logger.error("RabbitMQ connection error", { message: err.message });
      });

      connection.on("close", () => {
        logger.error("RabbitMQ connection closed unexpectedly");
      });

      channel = await connection.createChannel();

      await channel.assertExchange("autospace", "topic", {
        durable: true,
      });

      logger.info("RabbitMQ connected");
      return;
    } catch (err) {
      logger.error("RabbitMQ connection failed, retrying...", {
        error: err instanceof Error ? err.message : err,
      });
      retries--;

      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  throw new Error(" Could not connect to RabbitMQ after retries");
};

export const publishEvent = async (routingKey: string, data: unknown) => {
  if (!channel) {
    logger.error(
      "RabbitMQ channel not initialized — publishEvent called before connectRabbit",
    );
    return;
  }

  channel.publish("autospace", routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
