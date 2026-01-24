import apiClient from "@/lib/apiClient";
// import { api } from "@/lib/auth.api";

export const getMyCompany = async () => {
  const res = await apiClient.get("/api/companies/my");
  console.log("data", res.data.data);

  return res.data.data;
};

export const createCompany = async (payload: {
  name: string;
  email: string;
  phone: string;
  location: string;
}) => {
  const res = await apiClient.post("/api/companies/create", {
    companyName: payload.name,
    contactEmail: payload.email,
    contactPhone: payload.phone,
    businessLocation: payload.location,
  });
  return res.data.data;
};
