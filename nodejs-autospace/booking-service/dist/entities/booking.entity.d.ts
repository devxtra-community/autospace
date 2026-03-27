export declare enum BookingValetStatus {
    NONE = "NONE",
    REQUESTED = "REQUESTED",
    ASSIGNED = "ASSIGNED",
    ON_THE_WAY_TO_PICKUP = "ON_THE_WAY_TO_PICKUP",
    PICKED_UP = "PICKED_UP",
    PARKED = "PARKED",
    ON_THE_WAY_TO_DROP = "ON_THE_WAY_TO_DROP",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare class Booking {
    id: string;
    userId: string;
    garageId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    status: string;
    valetRequested: boolean;
    valetStatus: BookingValetStatus;
    vehicleType: "sedan" | "suv" | null;
    valetId: string | null;
    entryPin: string | null;
    exitPin: string | null;
    entryUsed: boolean;
    exitUsed: boolean;
    pickupPin: string | null;
    pickupPinUsed: boolean;
    currentValetRequestId: string | null;
    rejectedValetIds: string[] | null;
    amount: number;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    pickupAddress: string | null;
    paymentStatus: "unpaid" | "paid" | "failed";
    reviewSubmitted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=booking.entity.d.ts.map