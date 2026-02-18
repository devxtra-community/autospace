import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";

const bookingRepo = AppDataSource.getRepository(Booking);

export async function enterBookingService(bookingId: string, pin: string) {
  return await AppDataSource.transaction(async (manager) => {
    const repo = await manager.getRepository(Booking);

    const booking = await repo.findOne({ where: { id: bookingId } });

    if (!booking) throw new Error("Booking not found");

    if (booking.entryUsed) throw new Error("Entry already used");

    if (booking.entryPin !== pin) throw new Error("Invalid entry PIN");

    if (booking.status !== "confirmed")
      throw new Error("Booking not confirmed yet");

    // prevent entering before time

    const now = new Date();
    if (now < booking.startTime) throw new Error("Too early to enter");

    const exitPin = Math.floor(1000 + Math.random() * 9000).toString();

    booking.entryUsed = true;
    booking.exitPin = exitPin;
    booking.status = "occupied";

    await repo.save(booking);
    try {
      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/occupy`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );
    } catch {
      throw new Error("Failed to occupy slot");
    }

    return {
      bookingId: booking.id,
      exitPin: booking.exitPin,
      status: booking.status,
    };
  });
}

export async function exitBookingService(bookingId: string, pin: string) {
  return await AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(Booking);

    const booking = await repo.findOne({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    if (!booking.entryUsed) throw new Error("Car not entered yet");

    if (booking.exitUsed) throw new Error("Exit PIN already used");

    if (booking.exitPin !== pin) throw new Error("Invalid exit PIN");

    if (booking.status !== "occupied")
      throw new Error("Car not parked / booking not active");

    booking.exitUsed = true;
    booking.status = "completed";

    await repo.save(booking);

    try {
      await axios.post(
        `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );
    } catch {
      throw new Error("Failed to release slot");
    }

    return {
      bookingId: booking.id,
      status: booking.status,
    };
  });
}

export async function cancelBookingService(bookingId: string) {
  return await AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(Booking);

    const booking = await repo.findOne({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    if (booking.entryUsed) throw new Error("Cannot cancel after parking");

    if (!["pending", "confirmed"].includes(booking.status))
      throw new Error("Booking cannot be cancelled");

    booking.status = "cancelled";
    await repo.save(booking);

    await axios.post(
      `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}/release`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
          "x-user-id": "booking-service",
          "x-user-role": "SERVICE",
          "x-user-email": "service@internal",
        },
      },
    );

    return {
      bookingId: booking.id,
      status: booking.status,
    };
  });
}

export async function getActiveBookingService(userId: string) {
  const booking = await bookingRepo.findOne({
    where: [
      { userId, status: "confirmed" },
      { userId, status: "occupied" },
    ],
    order: { createdAt: "DESC" },
  });

  if (!booking) return null;

  return {
    bookingId: booking.id,
    status: booking.status,
    slotId: booking.slotId,
    startTime: booking.startTime,
    endTime: booking.endTime,
    entryPin: booking.entryUsed ? null : booking.entryPin,
    exitPin: booking.exitPin ?? null,
  };
}

export async function getBookingHistoryService(userId: string) {
  const bookings = await bookingRepo.find({
    where: [
      { userId, status: "completed" },
      { userId, status: "cancelled" },
    ],
    order: { createdAt: "DESC" },
  });

  return bookings.map((b) => ({
    bookingId: b.id,
    slotId: b.slotId,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status,
  }));
}
