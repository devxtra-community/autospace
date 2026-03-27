import { cancelBookingService, enrichBookingsWithSlot, enterBookingService, exitBookingService, getActiveBookingService, getBookingHistoryService, } from "../services/bookingEdge.service.js";
import { AppDataSource } from "../data-source.js";
import { Booking } from "../entities/booking.entity.js";
import axios from "axios";
export async function enterBookingController(req, res) {
    try {
        const bookingIdRaw = req.params.bookingId;
        const bookingId = Array.isArray(bookingIdRaw)
            ? bookingIdRaw[0]
            : bookingIdRaw;
        const { pin } = req.body;
        console.log("pin", pin);
        const userId = req.user?.id;
        if (!bookingId || !pin) {
            return res.status(400).json({
                success: false,
                message: "bookingId and pin required",
            });
        }
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await enterBookingService(bookingId, pin, userId);
        return res.status(200).json({
            success: true,
            message: "Entry successful, car parked",
            data: result,
        });
    }
    catch (error) {
        let message = "Entry failed";
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
export async function exitBooking(req, res) {
    try {
        const bookingIdRaw = req.params.bookingId;
        const bookingId = Array.isArray(bookingIdRaw)
            ? bookingIdRaw[0]
            : bookingIdRaw;
        const { pin } = req.body;
        if (!bookingId || !pin) {
            return res.status(400).json({
                success: false,
                message: "bookingId and pin required",
            });
        }
        const result = await exitBookingService(bookingId, pin);
        return res.status(200).json({
            success: true,
            message: "Exit successful, booking completed",
            data: result,
        });
    }
    catch (error) {
        let message = "Exit failed";
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
export async function cancelBooking(req, res) {
    try {
        const bookingIdRaw = req.params.bookingId;
        const bookingId = Array.isArray(bookingIdRaw)
            ? bookingIdRaw[0]
            : bookingIdRaw;
        const userId = req.user?.id;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID required",
            });
        }
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // M3 FIX: Ownership check — only the booking owner can cancel
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });
        }
        if (booking.userId !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const result = await cancelBookingService(bookingId);
        return res.status(200).json({
            success: true,
            message: "Booking cancelled",
            data: result,
        });
    }
    catch (error) {
        let message = "cancell failed";
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
export async function getActiveBooking(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const booking = await getActiveBookingService(userId);
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        let message = "booking failed";
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
export async function getBookingHistory(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const history = await getBookingHistoryService(userId);
        return res.status(200).json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        let message = "history failed";
        if (error instanceof Error) {
            message = error.message;
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
async function getManagerGarageId(managerId) {
    const res = await axios.get(`${process.env.RESOURCE_SERVICE_URL}/garages/internal/${managerId}/garageId`, {
        headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
            "x-user-id": "booking-service",
            "x-user-role": "SERVICE",
        },
    });
    return res.data.data.garageId;
}
export async function listManagerBookings(req, res) {
    const { page = 1, limit = 8, status, sort = "DESC" } = req.query;
    // M5 FIX: Limit search string length to prevent DoS via oversized inputs
    const rawSearch = req.query.search;
    const search = rawSearch ? rawSearch.slice(0, 100) : undefined;
    const userId = req.user?.id;
    // console.log("managerID" , userId);
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const garageId = await getManagerGarageId(userId);
    // console.log("garageId",garageId);
    const qb = AppDataSource.getRepository(Booking)
        .createQueryBuilder("b")
        .where("b.garageId = :garageId", { garageId });
    if (status) {
        qb.andWhere("b.status = :status", { status });
    }
    if (search) {
        qb.andWhere("(b.entryPin ILIKE :search OR b.exitPin ILIKE :search OR b.id::text ILIKE :search)", { search: `%${search}%` });
    }
    qb.orderBy("b.startTime", sort === "ASC" ? "ASC" : "DESC");
    qb.skip((Number(page) - 1) * Number(limit));
    qb.take(Number(limit));
    const [data, total] = await qb.getManyAndCount();
    const enrichedData = await enrichBookingsWithSlot(data);
    return res.json({
        success: true,
        data: enrichedData,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        },
    });
}
//# sourceMappingURL=bookingEdge.controller.js.map