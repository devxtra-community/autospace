import type { Request, Response } from "express";
export declare class BookingController {
    createBookingController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    confirmBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    assignValetInternal(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    rejectValet(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getManualAssignments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getValetRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getActiveJobs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCompletedJobs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCompanyBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateValetStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyPickupPin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const bookingController: BookingController;
//# sourceMappingURL=booking.controller.d.ts.map