import { GarageReview } from "../entities/garage-review.entity.js";
export declare const submitGarageReviewService: (userId: string, bookingId: string, rating: number, comment?: string) => Promise<GarageReview>;
export declare const getGarageReviewsService: (garageId: string, limit?: number, offset?: number) => Promise<({
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    date: string;
    user: {
        id: any;
        fullname: any;
    };
} | {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    date: string;
    user: null;
})[]>;
export declare const getGarageAverageRating: (garageId: string) => Promise<number | null>;
//# sourceMappingURL=garage-review.service.d.ts.map