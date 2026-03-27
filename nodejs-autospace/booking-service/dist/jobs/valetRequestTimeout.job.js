import cron from "node-cron";
import { Not, IsNull } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { BookingService } from "../services/booking.service.js";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";
const bookingService = new BookingService();
const TIMEOUT_MINUTES = 5;
export function startValetRequestTimeoutJob() {
    cron.schedule("* * * * *", async () => {
        try {
            const bookingRepo = AppDataSource.getRepository(Booking);
            const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);
            // Find all bookings where a valet has been sitting on a REQUESTED
            // status for longer than TIMEOUT_MINUTES without accepting.
            const timedOutBookings = await bookingRepo.find({
                where: {
                    valetStatus: BookingValetStatus.REQUESTED,
                    currentValetRequestId: Not(IsNull()),
                    paymentStatus: "paid",
                },
            });
            // Filter in-process: updatedAt must be older than the cutoff.
            // TypeORM's LessThan on updatedAt can conflict with auto-managed
            // @UpdateDateColumn precision on some DB drivers, so we filter in JS.
            const stale = timedOutBookings.filter((b) => b.updatedAt < cutoff);
            if (!stale.length)
                return;
            logger.info(`[ValetTimeout] ${stale.length} stale valet request(s) found`);
            for (const booking of stale) {
                const timedOutValetId = booking.currentValetRequestId;
                try {
                    logger.warn(`[ValetTimeout] Timed out: bookingId=${booking.id} valetId=${timedOutValetId}`);
                    // Reuse the existing rejection logic exactly — this handles:
                    //  • adding valetId to rejectedValetIds
                    //  • finding the next available valet (excluding rejected ones)
                    //  • setting valetStatus = REQUESTED (next valet) or NONE (no more valets)
                    await bookingService.rejectValetRequest(booking.id, timedOutValetId);
                    // Clear Redis cache so the old valet immediately stops seeing the
                    // request and the next valet / manager sees the updated state.
                    await redisClient.del(`booking:${booking.id}`);
                    await redisClient.del(`userBookings:v2:${booking.userId}`);
                    logger.info(`[ValetTimeout] Reassigned: bookingId=${booking.id} (from valetId=${timedOutValetId})`);
                }
                catch (err) {
                    logger.error(`[ValetTimeout] Failed to timeout booking ${booking.id}:`, err);
                }
            }
        }
        catch (err) {
            logger.error("[ValetTimeout] Cron job failed:", err);
        }
    });
}
//# sourceMappingURL=valetRequestTimeout.job.js.map