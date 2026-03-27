import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
export declare function enterBookingService(bookingId: string, pin: string, userId: string): Promise<{
    bookingId: string;
    exitPin: string;
    status: string;
}>;
export declare function exitBookingService(bookingId: string, pin: string): Promise<{
    bookingId: string;
    status: string;
}>;
export declare function cancelBookingService(bookingId: string): Promise<{
    bookingId: string;
    status: string;
}>;
export declare function getActiveBookingService(userId: string): Promise<{
    bookingId: string;
    status: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    entryPin: string | null;
    exitPin: string | null;
    valet: any;
} | null>;
export declare function getBookingHistoryService(userId: string): Promise<{
    bookingId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
    status: string;
}[]>;
export declare function enrichBookingsWithSlot(bookings: Booking[]): Promise<{
    entryPin: string;
    exitPin: string;
    pickupPin: string;
    slotNumber: any;
    slotSize: any;
    customerName: string;
    customerEmail: string;
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
    entryUsed: boolean;
    exitUsed: boolean;
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
}[]>;
//# sourceMappingURL=bookingEdge.service.d.ts.map