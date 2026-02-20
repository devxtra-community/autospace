import apiClient from "@/lib/apiClient";

export const getMyValet = async () => {
  const res = await apiClient.get("/api/valets/me");
  return res.data.data;
};

export const acceptBooking = async (bookingId: string) => {
  const valet = await getMyValet();

  const res = await apiClient.patch(`/api/valets/${valet.id}/assign`, {
    bookingId: bookingId,
  });

  return res.data;
};

export const rejectBooking = async (bookingId: string) => {
  const res = await apiClient.patch(
    `/api/bookings/internal/${bookingId}/reject`,
    {},
  );
  return res.data;
};

export const completeBooking = async (bookingId: string) => {
  const res = await apiClient.patch(`/api/bookings/update/${bookingId}`, {
    status: "completed",
  });

  return res.data;
};

export const getValetRequests = async () => {
  const res = await apiClient.get("/api/bookings/valet/requests");
  return res.data.data;
};

export const getActiveJobs = async () => {
  const res = await apiClient.get("/api/bookings/valet/active");
  return res.data.data;
};

export const getCompletedJobs = async () => {
  const res = await apiClient.get("/api/bookings/valet/completed");
  return res.data.data;
};
