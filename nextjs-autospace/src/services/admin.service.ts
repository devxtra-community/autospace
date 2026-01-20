import { apiClient } from "@/lib/api";

export const getPendingCompanies = async () => {
  const res = await apiClient.get("/api/admin/companies/pending");
  return res.data;
};

export const approveCompany = async (id: number) => {
  const res = await apiClient.post(`/api/admin/companies/${id}/approve`);
  return res.data;
};

export const rejectCompany = async (id: number) => {
  const res = await apiClient.post(`/api/admin/companies/${id}/reject`);
  return res.data;
};

export const getPendingGarages = async () => {
  const res = await apiClient.get("/api/admin/garages/pending");
  return res.data;
};

export const approveGarage = async (id: number) => {
  const res = await apiClient.post(`/api/admin/garages/${id}/approve`);
  return res.data;
};

export const rejectGarage = async (id: number) => {
  const res = await apiClient.post(`/api/admin/garages/${id}/reject`);
  return res.data;
};
