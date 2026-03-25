interface CreateBookingDto {
    userId: string;
    garageId: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
}
export declare class BookingService {
    createBooking(data: CreateBookingDto): Promise<{
        message: string;
        data: CreateBookingDto;
    }>;
    getBooking(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
export {};
//# sourceMappingURL=booking.service.d.ts.map