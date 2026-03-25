import apiClient from "@/lib/apiClient";

export const getMyCompany = async () => {
  const res = await apiClient.get("/api/companies/my");
  // console.log("data", res.data.data);

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

export const updateCompany = async (
  companyId: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  },
) => {
  const res = await apiClient.put(`/api/companies/${companyId}`, {
    companyName: payload.name,
    contactEmail: payload.email,
    contactPhone: payload.phone,
    businessLocation: payload.location,
  });

  return res.data.data;
};

export const getCompanyEmployees = async (
  companyId: string,
  filters?: {
    page?: number;
    limit?: number;
    role?: "MANAGER" | "VALET";
    employmentStatus?: string;
    search?: string;
  },
) => {
  const res = await apiClient.get(`/api/companies/${companyId}/employees`, {
    params: {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 10,
      role: filters?.role,
      employmentStatus: filters?.employmentStatus,
      search: filters?.search,
    },
  });
  //  console.log("employee",res.data);

  return res.data;
};

export const getCompanyBookings = async (
  companyId: string,
  filters?: {
    page?: number;
    limit?: number;
    garageId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  },
) => {
  const res = await apiClient.get(`/api/bookings/company/${companyId}`, {
    params: {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 10,
      garageId: filters?.garageId,
      status: filters?.status,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      search: filters?.search,
    },
  });

  return res.data;
};
