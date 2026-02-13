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
      const now = new Date();

      const toOccupy = await bookingRepo.find({
        where: {
          status: "confirmed",
          startTime: LessThanOrEqual(now),
        },
      });

      for (const booking of toOccupy) {
        try {
          await axios.post(
            `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/occupy`,
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

          booking.status = "occupied";
          await bookingRepo.save(booking);

          logger.info(`Slot OCCUPIED for booking ${booking.id}`);
        } catch (err) {
          logger.error(`Failed to OCCUPY slot for booking ${booking.id}`, err);
        }
      }

      const toComplete = await bookingRepo.find({
        where: {
          status: "occupied",
          endTime: LessThanOrEqual(now),
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
          booking.status = "completed";
          await bookingRepo.save(booking);

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
