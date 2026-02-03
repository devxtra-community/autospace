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
