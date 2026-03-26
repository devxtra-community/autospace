import { getGarageReviewsService, submitGarageReviewService, } from "../services/garage-review.service.js";
export const submitGarageReviewController = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { bookingId, rating, comment } = req.body;
        const review = await submitGarageReviewService(userId, bookingId, rating, comment);
        return res.status(201).json({
            success: true,
            data: review,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const getGarageReviewsController = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        const { limit, offset } = req.query;
        const reviews = await getGarageReviewsService(garageId, Number(limit) || 3, Number(offset) || 0);
        return res.status(200).json({
            success: true,
            data: reviews,
            message: "Reviews fetched successfully",
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const getAverageGarageRatingController = async (req, res) => {
    try {
        const garageId = req.params.garageId;
        const reviews = await getGarageReviewsService(garageId, 1000, 0); // get all reviews
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
        return res.status(200).json({
            success: true,
            data: { averageRating },
            message: "Average rating fetched successfully",
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
//# sourceMappingURL=garage-review.controller.js.map