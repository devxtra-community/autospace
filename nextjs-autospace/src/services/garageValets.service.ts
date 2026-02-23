import apiClient from "@/lib/apiClient";

export type GarageValet = {
  id: string;
  name: string;
  email: string;
  phone: string;

  employmentStatus: "PENDING" | "ACTIVE" | "REJECTED";
  availabilityStatus: "AVAILABLE" | "BUSY" | "OFFLINE" | "OFF_DUTY";

  garageId: string;
  companyId: string;
  createdAt: string;
};

export const getGarageValets = async (
  garageId: string,
  params?: {
    page?: number;
    limit?: number;
    employmentStatus?: "PENDING" | "ACTIVE" | "REJECTED";
    availabilityStatus?: "AVAILABLE" | "BUSY" | "OFFLINE" | "OFF_DUTY";
    search?: string;
  },
) => {
  const res = await apiClient.get(`/api/valets/garage/${garageId}`, { params });

  return res.data;
};
export const getPendingValets = async (
  garageId: string,
): Promise<GarageValet[]> => {
  const res = await apiClient.get(`/api/valets/pending`, {
    params: { garageId, page: 1, limit: 50 },
  });

  return res.data.data;
};

export const approveValet = async (valetId: string) => {
  const res = await apiClient.put(`/api/valets/${valetId}/manager/approve`);
  return res.data;
};

export const rejectValet = async (valetId: string) => {
  const res = await apiClient.put(`/api/valets/${valetId}/manager/reject`);
  return res.data;
};

export interface AvailableValet {
  id: string;
  name: string;
  phone: string;
  availabilityStatus: "AVAILABLE" | "BUSY" | "OFFLINE" | "OFF_DUTY";
}

export interface ManualAssignBooking {
  bookingId: string;

  customer: {
    id: string;
    name: string;
    phone: string;
  };

  garage: {
    id: string;
    name: string;
    location: string;
  };

  slot: {
    id: string;
    slotNumber: string;
    slotType: string;
  };

  timing: {
    startTime: string;
    endTime: string;
  };

  rejectedValetIds: string[];

  availableValets: AvailableValet[];

  createdAt: string;
}

export const getManualAssignBookings = async (): Promise<
  ManualAssignBooking[]
> => {
  const res = await apiClient.get("/api/bookings/manager/manual-assign");

  return res.data.data;
};

export const assignValetManually = async (
  bookingId: string,
  valetId: string,
) => {
  const res = await apiClient.patch(
    `/api/bookings/internal/${bookingId}/assign`,
    { valetId },
  );

  return res.data;
};
