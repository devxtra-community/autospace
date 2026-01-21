import { apiClient } from "@/lib/api";

export const getPendingCompanies = async () => {
  const res = await apiClient.get("/api/companies/admin/pending");
  return res.data;
};

export const approveCompany = async (id: number | string) => {
  const res = await apiClient.post(`/api/admin/companies/${id}/approve`);
  return res.data;
};

export const rejectCompany = async (id: number | string) => {
  const res = await apiClient.post(`/api/admin/companies/${id}/reject`);
  return res.data;
};

export const getPendingGarages = async () => {
  const res = await apiClient.get("/api/garages/admin/pending");
  return res.data;
};

export const approveGarage = async (id: number | string) => {
  const res = await apiClient.post(`/api/admin/garages/${id}/approve`);
  return res.data;
};

export const rejectGarage = async (id: number | string) => {
  const res = await apiClient.post(`/api/admin/garages/${id}/reject`);
  return res.data;
};
