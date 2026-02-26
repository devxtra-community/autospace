import amqp from "amqplib";
import { assignValetToBooking } from "../modules/valets/services/valet.service";

let channel: amqp.Channel;

export const initRabbit = async (): Promise<void> => {
  const conn = await amqp.connect("amqp://localhost");

  channel = await conn.createChannel();

  await channel.assertExchange("autospace", "topic", {
    durable: true,
  });

  console.log("RabbitMQ connected (resource-service)");
};

export const publishEvent = async (
  routingKey: string,
  data: Record<string, unknown>,
): Promise<void> => {
  if (!channel) {
    throw new Error("RabbitMQ not initialized");
  }

  channel.publish("autospace", routingKey, Buffer.from(JSON.stringify(data)));

  console.log("Event published:", routingKey, data);
};

export const startValetConsumer = async (): Promise<void> => {
  if (!channel) {
    throw new Error("RabbitMQ not initialized");
  }

  const q = await channel.assertQueue("valet.requested.queue", {
    durable: true,
  });

  await channel.bindQueue(q.queue, "autospace", "valet.requested");

  console.log("Waiting for valet.requested...");

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString()) as {
        bookingId: string;
        garageId: string;
      };

      console.log("Valet requested:", data);

      await assignValetToBooking(data.bookingId, data.garageId);

      channel.ack(msg);
    } catch (error) {
      console.error("Error processing valet.requested:", error);
    }
  });
};
