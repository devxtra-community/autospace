import cron from "node-cron";
import axios from "axios";
import { LessThan } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";
const bookingRepo = AppDataSource.getRepository(Booking);
const GRACE_MINUTES = 20;
export function startNoShowExpiryJob() {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const cutoff = new Date(now.getTime() - GRACE_MINUTES * 60 * 1000);
            logger.info(`NoShow Check | now=${now.toISOString()} cutoff=${cutoff.toISOString()}`);
            const noShows = await bookingRepo.find({
                where: {
                    status: "confirmed",
                    entryUsed: false,
                    startTime: LessThan(cutoff),
                },
            });
            if (!noShows.length)
                return;
            logger.warn(`No‑show cancelling ${noShows.length} bookings`);
            for (const booking of noShows) {
                try {
                    logger.warn(`Cancelling no‑show booking ${booking.id}`);
                    booking.status = "cancelled";
                    booking.paymentStatus = "failed";
                    if (booking.valetId) {
                        booking.valetStatus = BookingValetStatus.COMPLETED;
                    }
                    await bookingRepo.save(booking);
                    const res = await axios.post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`, {}, {
                        headers: {
                            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                            "x-user-id": "booking-service",
                            "x-user-role": "SERVICE",
                        },
                    });
                    logger.info(`Slot released for ${booking.id} status=${res.status}`);
                    if (booking.valetId) {
                        await axios
                            .patch(`${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`, { bookingId: booking.id }, {
                            headers: {
                                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                                "x-user-id": "booking-service",
                                "x-user-role": "SERVICE",
                            },
                        })
                            .catch(() => { });
                    }
                }
                catch (err) {
                    logger.error(`Failed cancelling no‑show ${booking.id}`, err);
                }
            }
        }
        catch (err) {
            logger.error("No‑show expiry job failed", err);
        }
    });
}
//# sourceMappingURL=noShowExpiry.job.js.map