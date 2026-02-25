import type { Request, Response } from "express";
import Stripe from "stripe";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { bookingService } from "../services/booking.service.js";

// Stripe and Repo are initialized inside the handler

export const createCheckoutSession = async (req: Request, res: Response) => {
  let bookingId: string | undefined;
  try {
    const bId = req.body.bookingId;

    if (!bId || typeof bId !== "string") {
      return res
        .status(400)
        .json({ message: "Valid bookingId required in request body" });
    }
    bookingId = bId;

    const bookingRepo = AppDataSource.getRepository(Booking);
    const booking = await bookingRepo.findOne({
      where: { id: bId },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: `Booking not found: ${bookingId}` });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "already paid" });
    }

    if (!booking.amount || Number(booking.amount) <= 0) {
      return res.status(400).json({ message: "Invalid booking amount" });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured in .env");
    }

    const amountInPaisa = Math.round(Number(booking.amount) * 100);

    const stripe = new Stripe(stripeKey);

    const amountInRupee = Math.round(booking.amount * 100);

    // Stripe minimum ≈ 50 INR
    if (amountInRupee < 5000) {
      return res.status(400).json({
        message: "Minimum booking amount is ₹50. Increase duration.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Garage Booking - ${booking.id}`,
            },
            unit_amount: amountInPaisa,
          },
          quantity: 1,
        },
      ],

      metadata: {
        bookingId: booking.id,
      },

      success_url: `http://localhost:3000/payment-success?bookingId=${booking.id}`,
      cancel_url: `http://localhost:3000/payment-cancel?bookingId=${booking.id}`,
    });

    return res.status(200).json({
      url: session.url, // frontend redirects to this
    });
  } catch (err) {
    console.error("Create checkout error detail:", err);
    if (bookingId) {
      try {
        await bookingService.deleteBooking(bookingId);
        console.log(
          `Deleted orphan booking and released slot for ${bookingId} due to payment failure`,
        );
      } catch (deleteErr) {
        console.error("Failed to cleanup orphan booking:", deleteErr);
      }
    }
    return res.status(500).json({
      message: "Failed to create checkout session",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
