import cron from "node-cron";
import axios from "axios";
import { LessThan } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";

const bookingRepo = AppDataSource.getRepository(Booking);

const GRACE_MINUTES = 20;

export function startNoShowExpiryJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - GRACE_MINUTES * 60 * 1000);

      const noShows = await bookingRepo.find({
        where: {
          status: "confirmed",
          entryUsed: false,
          startTime: LessThan(cutoff),
        },
      });

      if (!noShows.length) return;

      logger.info(`No‑show cancelling ${noShows.length} bookings`);

      for (const booking of noShows) {
        try {
          booking.status = "cancelled";
          await bookingRepo.save(booking);

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

          logger.info(`No‑show cancelled booking ${booking.id}`);
        } catch (err) {
          logger.error(`Failed cancelling no‑show ${booking.id}`, err);
        }
      }
    } catch (err) {
      logger.error("No‑show expiry job failed", err);
    }
  });
}
