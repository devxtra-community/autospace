import axios from "axios";
import { AppDataSource } from "../data-source.js";
import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { logger } from "../utils/logger.js";
const bookingRepo = AppDataSource.getRepository(Booking);
export async function enterBookingService(bookingId, pin, userId) {
    const result = await AppDataSource.transaction(async (manager) => {
        const repo = await manager.getRepository(Booking);
        const booking = await repo.findOne({ where: { id: bookingId } });
        if (!booking)
            throw new Error("Booking not found");
        try {
            const garageRes = await axios.get(`${process.env.RESOURCE_SERVICE_URL}/internal/garages/manager/${userId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                    "x-user-email": "service@internal",
                },
            });
            const managerGarage = garageRes.data?.data;
            if (!managerGarage || managerGarage.id !== booking.garageId) {
                throw new Error("Forbidden");
            }
        }
        catch {
            throw new Error("Manager not authorized for this garage");
        }
        if (booking.entryUsed)
            throw new Error("Entry already used");
        if (booking.entryPin !== pin)
            throw new Error("Invalid entry PIN");
        if (booking.status !== "confirmed")
            throw new Error("Booking not confirmed yet");
        const now = new Date();
        if (now < booking.startTime)
            throw new Error("Too early to enter");
        const exitPin = Math.floor(1000 + Math.random() * 9000).toString();
        booking.entryUsed = true;
        booking.exitPin = exitPin;
        booking.status = "occupied";
        await repo.save(booking);
        return {
            bookingId: booking.id,
            slotId: booking.slotId,
            exitPin: booking.exitPin,
            status: booking.status,
        };
    });
    // Perform external call AFTER transaction commit
    try {
        await axios.post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${result.slotId}/occupy`, {}, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        });
    }
    catch (err) {
        logger.error("CRITICAL: Failed to occupy slot after DB transaction commit", {
            slotId: result.slotId,
            error: err instanceof Error ? err.message : err,
        });
        // In a full production system, we'd queue this for retry.
        // For this audit fix, we'll log it as a critical failure.
    }
    return {
        bookingId: result.bookingId,
        exitPin: result.exitPin,
        status: result.status,
    };
}
export async function exitBookingService(bookingId, pin) {
    const result = await AppDataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Booking);
        const booking = await repo.findOne({ where: { id: bookingId } });
        if (!booking)
            throw new Error("Booking not found");
        if (!booking.entryUsed)
            throw new Error("Car not entered yet");
        if (booking.exitUsed)
            throw new Error("Exit PIN already used");
        if (booking.exitPin !== pin)
            throw new Error("Invalid exit PIN");
        if (booking.status !== "occupied")
            throw new Error("Car not parked / booking not active");
        booking.exitUsed = true;
        if (!booking.valetRequested) {
            booking.status = "completed";
        }
        else {
            booking.status = "occupied";
            booking.valetStatus = BookingValetStatus.ON_THE_WAY_TO_DROP;
        }
        await repo.save(booking);
        return {
            bookingId: booking.id,
            slotId: booking.slotId,
            status: booking.status,
            valetId: booking.valetId,
            valetRequested: booking.valetRequested,
        };
    });
    // External slot release
    try {
        await axios.post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${result.slotId}/release`, {}, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        });
    }
    catch (err) {
        logger.error("CRITICAL: Failed to release slot after DB transaction commit", {
            slotId: result.slotId,
            error: err instanceof Error ? err.message : err,
        });
    }
    // Release valet if manual parking
    if (!result.valetRequested && result.valetId) {
        await axios
            .patch(`${process.env.RESOURCE_SERVICE_URL}/internal/valets/${result.valetId}/release`, { bookingId: result.bookingId }, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        })
            .catch((err) => {
            logger.error("Failed to release valet after exit", {
                valetId: result.valetId,
                error: err instanceof Error ? err.message : err,
            });
        });
    }
    return {
        bookingId: result.bookingId,
        status: result.status,
    };
}
export async function cancelBookingService(bookingId) {
    const result = await AppDataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Booking);
        const booking = await repo.findOne({ where: { id: bookingId } });
        if (!booking)
            throw new Error("Booking not found");
        if (booking.entryUsed)
            throw new Error("Cannot cancel after parking");
        if (!["pending", "confirmed"].includes(booking.status))
            throw new Error("Booking cannot be cancelled");
        booking.status = "cancelled";
        if (booking.valetId) {
            booking.valetStatus = BookingValetStatus.COMPLETED;
        }
        await repo.save(booking);
        return {
            bookingId: booking.id,
            slotId: booking.slotId,
            status: booking.status,
            valetId: booking.valetId,
        };
    });
    // Release slot OUTSIDE transaction
    try {
        await axios.post(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${result.slotId}/release`, {}, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        });
    }
    catch (err) {
        logger.error("Failed to release slot after cancellation", {
            slotId: result.slotId,
            error: err instanceof Error ? err.message : err,
        });
    }
    // Release valet if assigned
    if (result.valetId) {
        await axios
            .patch(`${process.env.RESOURCE_SERVICE_URL}/internal/valets/${result.valetId}/release`, { bookingId: result.bookingId }, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
                "x-user-email": "service@internal",
            },
        })
            .catch((err) => {
            logger.error("Failed to release valet after cancellation", {
                valetId: result.valetId,
                error: err instanceof Error ? err.message : err,
            });
        });
    }
    return {
        bookingId: result.bookingId,
        status: result.status,
    };
}
export async function getActiveBookingService(userId) {
    const booking = await bookingRepo.findOne({
        where: [
            { userId, status: "confirmed" },
            { userId, status: "occupied" },
        ],
        order: { createdAt: "DESC" },
    });
    if (!booking)
        return null;
    let valet;
    if (booking.valetId) {
        const valetRes = await axios.get(`${process.env.AUTH_SERVICE_URL}/internal/users/${booking.valetId}`, {
            headers: {
                Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
                "x-user-id": "booking-service",
                "x-user-role": "SERVICE",
            },
        });
        valet = valetRes.data?.data ?? null;
    }
    return {
        bookingId: booking.id,
        status: booking.status,
        slotId: booking.slotId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        entryPin: booking.entryUsed ? null : booking.entryPin,
        // ONLY show exitPin when car is actually occupied
        exitPin: booking.status === "occupied" ? booking.exitPin : null,
        valet: valet,
    };
}
export async function getBookingHistoryService(userId) {
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
export async function enrichBookingsWithSlot(bookings) {
    const enriched = await Promise.all(bookings.map(async (booking) => {
        let slotNumber = null;
        let slotSize = null;
        let customerName = "Unknown";
        let customerEmail = "N/A";
        try {
            const slotRes = await axios.get(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/slots/${booking.slotId}`, {
                headers: {
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                },
            });
            const slot = slotRes.data.data;
            slotNumber = slot.slotNumber;
            slotSize = slot.slotSize;
        }
        catch {
            logger.error("Slot fetch failed for enrichBookings", { slotId: booking.slotId });
        }
        try {
            const userRes = await axios.get(`${process.env.AUTH_SERVICE_URL}/internal/users/${booking.userId}`, {
                headers: {
                    "x-user-id": "booking-service",
                    "x-user-role": "SERVICE",
                },
            });
            const user = userRes.data.data;
            customerName = user.fullname || "Unknown";
            customerEmail = user.email || "N/A";
        }
        catch {
            logger.error("User fetch failed for enrichBookings", { userId: booking.userId });
        }
        return {
            ...booking,
            entryPin: "****",
            exitPin: "****",
            pickupPin: "****",
            slotNumber,
            slotSize,
            customerName,
            customerEmail,
        };
    }));
    return enriched;
}
//# sourceMappingURL=bookingEdge.service.js.map