import amqp from "amqplib";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import redisClient from "./redis.js";

export const startValetAssignedConsumer = async () => {
  const conn = await amqp.connect("amqp://localhost");
  const ch = await conn.createChannel();

  await ch.assertExchange("autospace", "topic", { durable: true });

  const q = await ch.assertQueue("valet.request.created.queue", {
    durable: true,
  });

  await ch.bindQueue(q.queue, "autospace", "valet.request.created");

  console.log("Waiting for valet.request.created...");

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;

    const { bookingId, valetId } = JSON.parse(msg.content.toString());

    console.log("Valet assigned received:", bookingId, valetId);

    const repo = AppDataSource.getRepository(Booking);

    await repo.update(bookingId, {
      currentValetRequestId: valetId,
      rejectedValetIds: [],
      valetStatus: BookingValetStatus.REQUESTED,
    });

    await redisClient.del(`booking:${bookingId}:valetRequest`); // Clear any existing valet request cache

    console.log("Booking updated with valet request:", bookingId, valetId);

    ch.ack(msg);
  });
};
