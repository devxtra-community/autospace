import apiClient from "@/lib/apiClient";

export enum BookingValetStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  ASSIGNED = "ASSIGNED",
  COMPLETED = "COMPLETED",
}

export interface Booking {
  id: string;
  userId: string;
  garageId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: string;
  valetRequested: boolean;
  valetStatus: BookingValetStatus;
  valetId: string | null;
  createdAt: string;
  updatedAt: string;
  entryPin: string;
  exitPin: string;
  entryUsed: boolean;
  exitUsedd: boolean;
  vehicleType: string;
  // These might be needed if we want to store additional info
  garageName?: string;
  garageAddress?: string;
  garagePhone?: string;
}

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await apiClient.get("/api/bookings/my");
  return res.data.data;
  // console.log("ddddd",res.data.data);
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
  const res = await apiClient.get(`/api/bookings/${bookingId}`);
  return res.data.data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: string,
): Promise<Booking> => {
  const res = await apiClient.patch(`/api/bookings/update/${bookingId}`, {
    status,
  });
  return res.data.data;
};
