import amqp from "amqplib";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import redisClient from "./redis.js";
import { logger } from "../utils/logger.js";
export const startValetAssignedConsumer = async () => {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertExchange("autospace", "topic", { durable: true });
    const q = await ch.assertQueue("valet.request.created.queue", {
        durable: true,
    });
    await ch.bindQueue(q.queue, "autospace", "valet.request.created");
    logger.info("Waiting for valet.request.created messages");
    ch.consume(q.queue, async (msg) => {
        if (!msg)
            return;
        const { bookingId, valetId } = JSON.parse(msg.content.toString());
        logger.info("Valet assigned message received", { bookingId, valetId });
        const repo = AppDataSource.getRepository(Booking);
        await repo.update(bookingId, {
            currentValetRequestId: valetId,
            rejectedValetIds: [],
            valetStatus: BookingValetStatus.REQUESTED,
        });
        await redisClient.del(`booking:${bookingId}`); // Clear any existing valet request cache
        logger.info("Booking updated with valet request", { bookingId, valetId });
        ch.ack(msg);
    });
};
//# sourceMappingURL=valet.consumer.js.map