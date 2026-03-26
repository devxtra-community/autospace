export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
    failureReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=payment.entity.d.ts.map