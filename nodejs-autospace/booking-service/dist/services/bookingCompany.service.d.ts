interface Filters {
    page?: number;
    limit?: number;
    garageId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
export declare const getCompanyBookingsService: (companyId: string, filters: Filters) => Promise<{
    data: {
        bookingId: string;
        customerId: string;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        garageId: string;
        garageName: string;
        startTime: Date;
        endTime: Date;
        status: string;
        createdAt: Date;
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export {};
//# sourceMappingURL=bookingCompany.service.d.ts.map