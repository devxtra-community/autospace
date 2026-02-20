import cron from "node-cron";
import { LessThanOrEqual } from "typeorm";
import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";

const bookingRepo = AppDataSource.getRepository(Booking);

export function startBookingLifecycleJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const extendFive = 5;

      const now = new Date();

      const graceTime = new Date(now.getTime() - extendFive * 60 * 1000);

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
            .post(
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
            )
            .catch(() => {});

          // update booking status
          await bookingRepo.update(booking.id, {
            status: "completed",
          });

          logger.info(`Booking COMPLETED ${booking.id}`);
        } catch (err) {
          logger.error(`Failed to COMPLETE booking ${booking.id}`, err);
        }
      }
    } catch (error) {
      logger.error("Booking lifecycle job failed", error);
    }
  });
}
