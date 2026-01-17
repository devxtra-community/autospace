import { api } from "@/lib/auth.api";

export const getMyCompany = async () => {
  const res = await api.get("/api/companies/my");
  return res.data.data;
};

export const createCompany = async (payload: {
  name: string;
  email: string;
  phone: string;
  location: string;
  registrationNumber: string;
}) => {
  const res = await api.post("/api/company", payload);
  return res.data.data;
};
