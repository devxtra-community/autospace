import apiClient from "@/lib/apiClient";

export enum BookingValetStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  ASSIGNED = "ASSIGNED",
  ON_THE_WAY_TO_PICKUP = "ON_THE_WAY_TO_PICKUP",
  PICKED_UP = "PICKED_UP",
  PARKED = "PARKED",
  ON_THE_WAY_TO_DROP = "ON_THE_WAY_TO_DROP",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
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
  entryPin: string | null;
  exitPin: string | null;
  entryUsed: boolean;
  exitUsedd: boolean;
  pickupPin: string | null;
  pickupPinUsed: boolean;
  vehicleType: string;
  slotNumber: string;
  floorNumber: number;
  slotSize: string;
  amount: number;
  reviewSubmitted: boolean;
  // These might be needed if we want to store additional info
  garageName?: string;
  garageAddress?: string;
  garagePhone?: string;
  valet?: {
    id: string;
    fullname: string;
    phone: string;
  };
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

export async function submitGarageReview(data: {
  bookingId: string;
  rating: number;
  comment?: string;
}) {
  const res = await apiClient.post("api/bookings/reviews", data);
  return res.data.data;
}

export const getGarageReviews = async (
  garageId: string,
  limit = 3,
  offset = 0,
) => {
  const res = await apiClient.get(
    `/api/bookings/${garageId}/reviews?limit=${limit}&offset=${offset}`,
  );

  return res.data.data;
};

export const getAverageGarageRating = async (garageId: string) => {
  const res = await apiClient.get(`/api/bookings/${garageId}/rating`);

  return res.data.data;
};

export const getManagerBookings = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: "ASC" | "DESC";
}) => {
  const res = await apiClient.get("/api/bookings/manager/bookings", { params });
  return res.data;
};
