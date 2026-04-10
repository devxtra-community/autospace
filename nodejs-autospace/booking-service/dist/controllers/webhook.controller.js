import Stripe from "stripe";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { Payment, PaymentStatus } from "../entities/payment.entity.js";
import { BookingService } from "../services/booking.service.js";
import { logger } from "../utils/logger.js";
// Stripe, repo and service initialized inside handler
export const stripeWebhookController = async (req, res) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        logger.error("STRIPE_SECRET_KEY missing in webhook handler");
        return res.status(500).send("Configuration error");
    }
    const stripe = new Stripe(stripeKey);
    const bookingRepo = AppDataSource.getRepository(Booking);
    const bookingService = new BookingService();
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, // MUST be raw body
        sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (error) {
        let message = "payment of this bookin failed";
        if (error instanceof Error) {
            message = error.message;
        }
        logger.warn("Stripe webhook signature verification failed", { message });
        return res.status(200).json({ received: true });
    }
    logger.info("Stripe event received", { type: event.type });
    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId;
            const paymentIntentId = session.payment_intent;
            const amount = session.amount_total ?? 0;
            if (!bookingId) {
                logger.warn("Stripe webhook received with no bookingId in metadata");
                return res.status(200).send("No bookingId");
            }
            const paymentRepo = AppDataSource.getRepository(Payment);
            const existing = await paymentRepo.findOne({
                where: { stripePaymentIntentId: paymentIntentId },
            });
            if (existing) {
                logger.info("Duplicate Stripe webhook ignored", { paymentIntentId });
                return res.status(200).send("Already processed");
            }
            const updatedBooking = await AppDataSource.transaction(async (manager) => {
                const booking = await manager.findOne(Booking, {
                    where: {
                        id: bookingId,
                        status: "payment_pending",
                    },
                });
                if (!booking) {
                    logger.warn("Booking already finalized — ignoring webhook", { bookingId });
                    return null;
                }
                booking.paymentStatus = "paid";
                booking.amount = amount / 100;
                booking.status = "confirmed";
                const savedBooking = await manager.save(booking);
                const payment = manager.create(Payment, {
                    bookingId: booking.id,
                    userId: booking.userId,
                    amount: Math.round(amount),
                    currency: (session.currency || "inr").toUpperCase(),
                    status: PaymentStatus.SUCCESS,
                    stripePaymentIntentId: paymentIntentId,
                    stripeChargeId: null,
                    failureReason: null,
                });
                await manager.save(payment);
                return savedBooking; //  return it
            });
            // AFTER transaction
            if (updatedBooking && updatedBooking.valetRequested) {
                try {
                    await bookingService.assignFirstValetRequest(updatedBooking, AppDataSource.manager);
                }
                catch (error) {
                    let message = "valet assign failed";
                    if (error instanceof Error) {
                        message = error.message;
                    }
                    return res.status(400).json({
                        success: false,
                        message,
                    });
                }
            }
            logger.info("Payment success confirmed for booking", { bookingId, amount: amount / 100 });
        }
        if (event.type === "payment_intent.payment_failed") {
            const intent = event.data.object;
            const paymentRepo = AppDataSource.getRepository(Payment);
            await paymentRepo.update({ stripePaymentIntentId: intent.id }, {
                status: PaymentStatus.FAILED,
                failureReason: intent.last_payment_error?.message || "Failed",
            });
            logger.warn("Stripe payment failed", { paymentIntentId: intent.id });
        }
        if (event.type === "checkout.session.expired") {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId;
            if (!bookingId)
                return res.status(200).send();
            const booking = await bookingRepo.findOne({ where: { id: bookingId } });
            if (!booking)
                return res.status(200).send();
            booking.status = "cancelled";
            booking.paymentStatus = "failed";
            await bookingRepo.save(booking);
            await bookingService.releaseSlot(booking.slotId);
        }
        return res.status(200).json({ received: true });
    }
    catch (err) {
        logger.error("Stripe webhook processing error", {
            error: err instanceof Error ? err.message : err,
            stack: err instanceof Error ? err.stack : undefined,
        });
        return res.status(500).send("Webhook handler failed");
    }
};
//# sourceMappingURL=webhook.controller.js.map