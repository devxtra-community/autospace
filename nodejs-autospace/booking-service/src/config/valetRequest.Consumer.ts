import amqp from "amqplib";
import axios from "axios";
import { publishEvent } from "../config/rabbitmq.js";

export const startValetRequestedConsumer = async () => {
  const conn = await amqp.connect("amqp://localhost");
  const ch = await conn.createChannel();

  await ch.assertExchange("autospace", "topic", { durable: true });

  const q = await ch.assertQueue("valet.requested.queue", {
    durable: true,
  });

  await ch.bindQueue(q.queue, "autospace", "valet.requested");

  console.log("Listening for valet.requested");

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;

    const { bookingId, garageId } = JSON.parse(msg.content.toString());

    try {
      const res = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/valets/available/${garageId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
          },
        },
      );

      const valet = res.data?.data;

      if (!valet) {
        console.log("No available valet");
        ch.ack(msg);
        return;
      }

      await publishEvent("valet.request.created", {
        bookingId,
        valetId: valet.id,
      });
    } catch (err) {
      console.error("Valet dispatch failed", err);
    }

    ch.ack(msg);
  });
};
