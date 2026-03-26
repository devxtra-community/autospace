import cron from "node-cron";
import { LessThanOrEqual } from "typeorm";
import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";
import redisClient from "../config/redis.js";
const bookingRepo = AppDataSource.getRepository(Booking);
export function startBookingLifecycleJob() {
    cron.schedule("* * * * *", async () => {
        try {
            const extendFive = 5;
            const now = new Date();
            const graceTime = new Date(now.getTime() - extendFive * 60 * 1000);
            // ── 1. Auto-COMPLETE bookings that became "occupied" and time is up ──────
            const toComplete = await bookingRepo.find({
                where: {
                    status: "occupied",
                    endTime: LessThanOrEqual(graceTime),
                },
            });
            for (const booking of toComplete) {
                try {
                    // free slot
                    await axios
                        .post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`, {}, {
                        headers: {
                            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                            "x-user-id": "booking-service",
                            "x-user-role": "SERVICE",
                            "x-user-email": "service@internal",
                        },
                    })
                        .catch(() => { });
                    if (booking.valetId) {
                        await axios
                            .patch(`${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`, { bookingId: booking.id }, {
                            headers: {
                                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                                "x-user-id": "booking-service",
                                "x-user-role": "SERVICE",
                                "x-user-email": "service@internal",
                            },
                        })
                            .catch(() => { });
                    }
                    // update booking status
                    await bookingRepo.update(booking.id, {
                        status: "completed",
                        valetStatus: BookingValetStatus.COMPLETED,
                    });
                    logger.info(`Booking COMPLETED ${booking.id}`);
                }
                catch (err) {
                    logger.error(`Failed to COMPLETE booking ${booking.id}`, err);
                }
            }
            // ── 2. Auto-CANCEL bookings stuck in "confirmed"/"pending" past endTime ──
            // This covers the case where valet was requested but never picked up the car,
            // leaving the booking permanently stuck as "active" in the customer UI.
            const toCancel = await bookingRepo.find({
                where: [
                    { status: "confirmed", endTime: LessThanOrEqual(graceTime) },
                    { status: "pending", endTime: LessThanOrEqual(graceTime) },
                ],
            });
            for (const booking of toCancel) {
                try {
                    // Release the parking slot so it's available again
                    await axios
                        .post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`, {}, {
                        headers: {
                            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                            "x-user-id": "booking-service",
                            "x-user-role": "SERVICE",
                            "x-user-email": "service@internal",
                        },
                    })
                        .catch(() => { });
                    // Release valet if one was assigned (but never completed)
                    if (booking.valetId) {
                        await axios
                            .patch(`${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`, { bookingId: booking.id }, {
                            headers: {
                                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                                "x-user-id": "booking-service",
                                "x-user-role": "SERVICE",
                                "x-user-email": "service@internal",
                            },
                        })
                            .catch(() => { });
                    }
                    // Mark as cancelled — valet was never actually used
                    await bookingRepo.update(booking.id, {
                        status: "cancelled",
                        valetStatus: BookingValetStatus.COMPLETED,
                    });
                    // Clear Redis cache so the customer UI updates immediately
                    await redisClient
                        .del(`userBookings:v2:${booking.userId}`)
                        .catch(() => { });
                    await redisClient.del(`booking:${booking.id}`).catch(() => { });
                    logger.info(`Booking CANCELLED (expired without valet pickup) ${booking.id}`);
                }
                catch (err) {
                    logger.error(`Failed to CANCEL expired booking ${booking.id}`, err);
                }
            }
        }
        catch (error) {
            logger.error("Booking lifecycle job failed", error);
        }
    });
}
//# sourceMappingURL=bookingLifeCycle.job.js.map