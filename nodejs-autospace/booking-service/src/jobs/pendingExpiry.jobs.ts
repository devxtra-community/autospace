import cron from "node-cron";
import { LessThan } from "typeorm";
import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { Payment } from "../entities/payment.entity.js";
import { logger } from "../utils/logger.js";
import Stripe from "stripe";
// import { BookingService } from "../services/booking.service.js";

const bookingRepo = AppDataSource.getRepository(Booking);
const paymentRepo = AppDataSource.getRepository(Payment);

const EXPIRY_MINUTES = 20;

export function startPendingExpiryJob() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  cron.schedule("* * * * *", async () => {
    try {
      const expiryTime = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);
      // const bookingService = new BookingService();

      const expiredBookings = await bookingRepo.find({
        where: {
          status: "payment_pending",
          paymentStatus: "unpaid",
          createdAt: LessThan(expiryTime),
        },
      });

      if (!expiredBookings.length) return;

      logger.info(
        `Expiring ${expiredBookings.length} payment_pending bookings`,
      );

      for (const booking of expiredBookings) {
        try {
          //  Find payment record
          const payment = await paymentRepo.findOne({
            where: { bookingId: booking.id },
          });

          // If payment exists → verify with Stripe
          if (payment?.stripePaymentIntentId) {
            try {
              const intent = await stripe.paymentIntents.retrieve(
                payment.stripePaymentIntentId,
              );

              if (intent.status === "succeeded") {
                logger.warn(
                  `Webhook missed — auto confirming booking ${booking.id}`,
                );

                booking.status = "confirmed";
                booking.paymentStatus = "paid";
                await bookingRepo.save(booking);

                continue; // skip cancellation
              }
            } catch (stripeErr) {
              logger.error("Stripe verification failed", stripeErr);
            }
          }

          //  Truly unpaid → cancel booking
          booking.status = "cancelled";
          booking.paymentStatus = "failed";
          await bookingRepo.save(booking);

          await axios.post(
            `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`,
            {},
            {
              headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
              },
            },
          );

          logger.info(`Expired booking ${booking.id}`);

          if (booking.valetId) {
            await axios
              .patch(
                `${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`,
                { bookingId: booking.id },
                {
                  headers: {
                    Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                  },
                },
              )
              .catch(() => {});
          }
        } catch (err) {
          logger.error(`Failed to expire booking ${booking.id}`, err);
        }
      }
    } catch (error) {
      logger.error("Pending expiry job failed", error);
    }
  });
}
