import { BookingService } from '../services/booking.service.js';
const bookingService = new BookingService();
export const createBooking = async (req, res) => {
    try {
        const result = await bookingService.createBooking(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getBooking = async (req, res) => {
    try {
        const result = await bookingService.getBooking(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
//# sourceMappingURL=booking.controller.js.map