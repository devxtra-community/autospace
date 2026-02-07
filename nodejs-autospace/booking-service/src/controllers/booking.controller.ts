import type { Request, Response } from "express";
import { BookingService } from "../services/booking.service.js";

const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.createBooking(req.body);
    res.status(201).json(result);
  } catch (error: unknown) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.getBooking(req.params.id as string);
    res.status(200).json(result);
  } catch (error: unknown) {
    res.status(404).json({ message: (error as Error).message });
  }
};
