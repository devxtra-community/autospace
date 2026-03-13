import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";

const bookingRepo = AppDataSource.getRepository(Booking);

export async function enterBookingService(
  bookingId: string,
  pin: string,
  userId: string,
) {
  return await AppDataSource.transaction(async (manager) => {
    const repo = await manager.getRepository(Booking);

    const booking = await repo.findOne({ where: { id: bookingId } });

    if (!booking) throw new Error("Booking not found");

    // M4 FIX: Ownership check
    // if (booking.userId !== userId) throw new Error("Forbidden");

    try {
      const garageRes = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/internal/garages/manager/${userId}`,
        {
          headers: {
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
            "x-user-email": "service@internal",
          },
        },
      );

      const managerGarage = garageRes.data?.data;

      if (!managerGarage || managerGarage.id !== booking.garageId) {
        throw new Error("Forbidden");
      }
    } catch {
      throw new Error("Manager not authorized for this garage");
    }

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

    if (!booking.valetRequested) {
      // Self parking → booking finishes immediately
      booking.status = "completed";
    }

    if (booking.valetRequested) {
      booking.status = "occupied";
      booking.valetStatus = BookingValetStatus.ON_THE_WAY_TO_DROP;
    }

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

    // M6 FIX: Release valet in resource-service after exit
    if (!booking.valetRequested && booking.valetId) {
      await axios
        .patch(
          `${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`,
          { bookingId: booking.id },
          {
            headers: {
              Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
              "x-user-email": "service@internal",
            },
          },
        )
        .catch(() => {});
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
    if (booking.valetId) {
      booking.valetStatus = BookingValetStatus.COMPLETED;
    }
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

    if (booking.valetId) {
      await axios
        .patch(
          `${process.env.RESOURCE_SERVICE_URL}/internal/valets/${booking.valetId}/release`,
          { bookingId: booking.id },
          {
            headers: {
              Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
              "x-user-email": "service@internal",
            },
          },
        )
        .catch(() => {});
    }

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
  let valet;

  if (booking.valetId) {
    const valetRes = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.valetId}`,
    );
    valet = valetRes.data?.data ?? null;
  }

  return {
    bookingId: booking.id,
    status: booking.status,
    slotId: booking.slotId,
    startTime: booking.startTime,
    endTime: booking.endTime,
    entryPin: booking.entryUsed ? null : booking.entryPin,
    exitPin: booking.exitPin ?? null,
    valet: valet,
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

export async function enrichBookingsWithSlot(bookings: Booking[]) {
  const enriched = await Promise.all(
    bookings.map(async (booking) => {
      let slotNumber = null;
      let slotSize = null;
      let customerName = "Unknown";
      let customerEmail = "N/A";

      try {
        const slotRes = await axios.get(
          `${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}`,
          {
            headers: {
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
            },
          },
        );

        const slot = slotRes.data.data;
        slotNumber = slot.slotNumber;
        slotSize = slot.slotSize;
      } catch {
        console.error("Slot fetch failed for", booking.slotId);
      }

      try {
        const userRes = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`,
          {
            headers: {
              "x-user-id": "booking-service",
              "x-user-role": "SERVICE",
            },
          },
        );
        const user = userRes.data.data;
        customerName = user.fullname || "Unknown";
        customerEmail = user.email || "N/A";
      } catch {
        console.error("User fetch failed for", booking.userId);
      }

      return {
        ...booking,
        slotNumber,
        slotSize,
        customerName,
        customerEmail,
      };
    }),
  );

  return enriched;
}
