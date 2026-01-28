import apiClient from "@/lib/apiClient";

export const createGarage = async (payload: {
  name: string;
  description: string;
  location: string;
  images?: string[];
}) => {
  const res = await apiClient.post("/api/garages/create", payload);
  return res.data.data;
};

export const getMyGarages = async (companyId: string) => {
  const res = await apiClient.get(`/api/garages/byCompany/${companyId}`);
  return res.data.data;
};
