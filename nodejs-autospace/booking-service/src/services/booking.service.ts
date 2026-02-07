interface CreateBookingDto {
  userId: string;
  garageId: string;
  slotId: string;
  startTime: Date;
  endTime: Date;
}

export class BookingService {
  // Placeholder method
  async createBooking(data: CreateBookingDto) {
    // Implementation here
    return { message: "Booking created", data };
  }

  async getBooking(id: string) {
    // Implementation here
    return { message: "Booking details", id };
  }
}
