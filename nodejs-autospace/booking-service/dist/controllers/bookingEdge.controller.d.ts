import type { Request, Response } from "express";
export declare function enterBookingController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function exitBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getActiveBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listManagerBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bookingEdge.controller.d.ts.map