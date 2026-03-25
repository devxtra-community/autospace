import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import { GarageReview } from "../entities/garage-review.entity.js";
import axios from "axios";

export const submitGarageReviewService = async (
  userId: string,
  bookingId: string,
  rating: number,
  comment?: string,
) => {
  const bookingRepo = AppDataSource.getRepository(Booking);
  const reviewRepo = AppDataSource.getRepository(GarageReview);

  const booking = await bookingRepo.findOne({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.userId !== userId) throw new Error("Unauthorized");

  if (booking.status !== "completed") throw new Error("Booking not completed");

  if (booking.reviewSubmitted) throw new Error("Review already submitted");

  const review = reviewRepo.create({
    garageId: booking.garageId,
    userId,
    bookingId,
    rating,
    comment: comment ?? null,
  });

  await reviewRepo.save(review);
  booking.reviewSubmitted = true;
  await bookingRepo.save(booking);
  return review;
};

export const getGarageReviewsService = async (
  garageId: string,
  limit = 3,
  offset = 0,
) => {
  const repo = AppDataSource.getRepository(GarageReview);

  const reviews = await repo.find({
    where: { garageId },
    order: { createdAt: "DESC" },
    take: limit,
    skip: offset,
  });

  const enriched = await Promise.all(
    reviews.map(async (review) => {
      try {
        const res = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/internal/users/${review.userId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,

          createdAt: review.createdAt,

          date: new Date(review.createdAt).toISOString(),

          user: {
            id: res.data.data.id,
            fullname: res.data.data.fullname,
          },
        };
      } catch {
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          date: new Date(review.createdAt).toISOString(),
          user: null,
        };
      }
    }),
  );

  return enriched;
};
export const getGarageAverageRating = async (garageId: string) => {
  const repo = AppDataSource.getRepository(GarageReview);

  const reviews = await repo.find({
    where: { garageId },
  });

  if (reviews.length === 0) return null;

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  return averageRating;
};
