import { Booking, BookingValetStatus } from "../entities/booking.entity.js";
import { EntityManager } from "typeorm";
type ValetInternal = {
    id: string;
    fullname?: string;
    phone?: string;
    email?: string;
    employmentStatus?: string;
};
export declare class BookingService {
    checkOverlap(slotId: string, start: Date, end: Date): Promise<boolean>;
    lockSlot(slotId: string): Promise<boolean>;
    releaseSlot(slotId: string): Promise<void>;
    releaseValet(valetId: string): Promise<void>;
    createBooking(bookingData: {
        userId: string;
        garageId: string;
        slotId: string;
        startTime: Date;
        endTime: Date;
        amount: number;
        vehicleType: "sedan" | "suv";
        status?: string;
        valetRequested: boolean;
        pickupLatitude: number;
        pickupLongitude: number;
        pickupAddress: string;
    }): Promise<Booking>;
    assignFirstValetRequest(booking: Booking, manager: EntityManager): Promise<Booking | null>;
    rejectValetRequest(bookingId: string, valetId: string): Promise<Booking>;
    updateBookingWithValet(booking: Booking): Promise<Booking>;
    getBookingById(id: string): Promise<any>;
    getManualAssignments(managerId: string): Promise<{
        bookingId: string;
        customer: {
            id: string;
            name: string;
            phone: string;
        };
        garage: {
            id: any;
            name: any;
            location: any;
        };
        slot: {
            id: string;
            slotNumber: string;
            slotType: string;
        };
        timing: {
            startTime: Date;
            endTime: Date;
        };
        rejectedValetIds: string[];
        availableValets: ValetInternal[];
        createdAt: Date;
    }[]>;
    getUserBookings(userId: string): Promise<any[]>;
    updateBookingStatus(bookingId: string, status: string): Promise<Booking>;
    deleteBooking(bookingId: string): Promise<boolean>;
    verifyOwnership(bookingId: string, userId: string): Promise<Booking>;
    private enrichBookings;
    getValetRequests(valetId: string): Promise<({
        id: string;
        customerName: any;
        customerPhone: any;
        garageName: any;
        garageLocation: any;
        floorNumber: any;
        slotNumber: any;
        slotType: any;
        entryPin: string | null;
        exitPin: string | null;
        pickupPin: string | null;
        pickupTime: Date;
        dropTime: Date;
        valetStatus: BookingValetStatus;
        createdAt: Date;
        pickupAddress: string | null;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
    } | null)[]>;
    getActiveJobs(valetId: string): Promise<({
        id: string;
        customerName: any;
        customerPhone: any;
        garageName: any;
        garageLocation: any;
        floorNumber: any;
        slotNumber: any;
        slotType: any;
        entryPin: string | null;
        exitPin: string | null;
        pickupPin: string | null;
        pickupTime: Date;
        dropTime: Date;
        valetStatus: BookingValetStatus;
        createdAt: Date;
        pickupAddress: string | null;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
    } | null)[]>;
    getCompletedJobs(valetId: string): Promise<({
        id: string;
        customerName: any;
        customerPhone: any;
        garageName: any;
        garageLocation: any;
        floorNumber: any;
        slotNumber: any;
        slotType: any;
        entryPin: string | null;
        exitPin: string | null;
        pickupPin: string | null;
        pickupTime: Date;
        dropTime: Date;
        valetStatus: BookingValetStatus;
        createdAt: Date;
        pickupAddress: string | null;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
    } | null)[]>;
    private sendValetStatusEmail;
    updateValetStatus(bookingId: string, valetStatus: BookingValetStatus): Promise<Booking>;
    verifyPickupPin(bookingId: string, valetId: string, pin: string): Promise<{
        valetStatus: BookingValetStatus;
        entryPin: string | null;
    }>;
}
export declare const bookingService: BookingService;
export {};
//# sourceMappingURL=booking.service.d.ts.map