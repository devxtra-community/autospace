import cron from "node-cron";
import { LessThan } from "typeorm";
import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";

const bookingRepo = AppDataSource.getRepository(Booking);

const EXPIRY_MINUTES = 10;

export function startPendingExpiryJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const expiryTime = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

      const expiredBookings = await bookingRepo.find({
        where: {
          status: "pending",
          createdAt: LessThan(expiryTime),
        },
      });

      if (!expiredBookings.length) return;

      logger.info(` Expiring ${expiredBookings.length} pending bookings`);

      for (const booking of expiredBookings) {
        try {
          // 1. Update booking → cancelled
          booking.status = "cancelled";
          await bookingRepo.save(booking);

          // 2. Release slot in resource service
          await axios.post(
            `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`,
            {},
            {
              headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
              },
            },
          );

          logger.info(` Expired booking ${booking.id}`);
        } catch (err) {
          logger.error(` Failed to expire booking ${booking.id}`, err);
        }
      }
    } catch (error) {
      logger.error(" Pending expiry job failed", error);
    }
  });
}
