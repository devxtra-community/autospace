import amqp from "amqplib";
import axios from "axios";
import { publishEvent } from "../config/rabbitmq.js";
import { logger } from "../utils/logger.js";

export const startValetRequestedConsumer = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  const ch = await conn.createChannel();

  await ch.assertExchange("autospace", "topic", { durable: true });

  const q = await ch.assertQueue("booking.valet.requested.queue", {
    durable: true,
  });

  await ch.bindQueue(q.queue, "autospace", "valet.requested");

  logger.info("Listening for valet.requested messages");

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;

    const { bookingId, garageId } = JSON.parse(msg.content.toString());

    try {
      const res = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${garageId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const valet = res.data?.data;

      if (!valet) {
        logger.info("No available valet found", { bookingId, garageId });
        ch.ack(msg);
        return;
      }

      await publishEvent("valet.request.created", {
        bookingId,
        valetId: valet.id,
      });
    } catch (err) {
      logger.error("Valet dispatch failed", {
        bookingId,
        garageId,
        error: err instanceof Error ? err.message : err,
      });
    }

    ch.ack(msg);
  });
};
