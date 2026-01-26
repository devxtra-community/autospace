import apiClient from "@/lib/apiClient";

export const getPendingCompanies = async () => {
  const res = await apiClient.get("/api/companies/admin/pending");
  return res.data;
};

export const approveCompany = async (id: number | string) => {
  const res = await apiClient.put(`/api/companies/admin/${id}/active`);
  return res.data;
};

export const rejectCompany = async (id: number | string) => {
  const res = await apiClient.put(`/api/companies/admin/${id}/reject`);
  return res.data;
};

export const getPendingGarages = async () => {
  const res = await apiClient.get("/api/garages/admin/pending");
  return res.data;
};

export const approveGarage = async (id: number | string) => {
  const res = await apiClient.put(`/api/garages/admin/${id}/active`);
  return res.data;
};

export const rejectGarage = async (id: number | string) => {
  const res = await apiClient.put(`/api/admin/garages/${id}/reject`);
  return res.data;
};
