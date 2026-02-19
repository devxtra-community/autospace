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
  status?: "PENDING" | "ACTIVE" | "REJECTED",
): Promise<GarageValet[]> => {
  const res = await apiClient.get(`/api/valets/garage/${garageId}`, {
    params: { status, page: 1, limit: 50 },
  });

  return res.data.data;
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
