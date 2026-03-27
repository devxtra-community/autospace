export declare class ValidationError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
export declare function validateId(id: string, field: string): void;
export declare function validateBookingInput(data: {
    slotId?: string;
    userId?: string;
    garageId?: string;
    startTime?: string | Date;
    endTime?: string | Date;
    vehicleType: string;
    amount?: number;
    status?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    pickupAddress?: string;
    valetRequested?: boolean;
}): void;
export declare function validateStatusTransition(current: string, next: string): boolean;
//# sourceMappingURL=booking.validator.d.ts.map