import apiClient from "@/lib/apiClient";

export const createGarage = async (payload: {
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  capacity: number;
  images?: string[];
  description?: string;
}) => {
  const res = await apiClient.post("/api/garages/register", payload);
  return res.data.data;
};

export const getMyGarages = async (companyId: string) => {
  const res = await apiClient.get(`/api/garages/byCompany/${companyId}`);
  return res.data.data;
};

export const getGarageById = async (garageId: string) => {
  const res = await apiClient.get(`/api/garages/${garageId}`);
  return res.data.data;
};

export const updateGarageProfile = async (
  garageId: string,
  data: {
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    valetAvailable?: boolean;
    capacity?: number;
  },
) => {
  const res = await apiClient.put(`/api/garages/${garageId}`, data);
  return res.data.data;
};

export const assignManagerToGarage = async (payload: {
  garageCode: string;
  managerId: string;
}) => {
  const res = await apiClient.post("/api/garages/assign-manager", payload);
  return res.data.data;
};
