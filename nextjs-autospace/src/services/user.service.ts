import apiClient from "@/lib/apiClient";

export const getMyProfile = async () => {
  const res = await apiClient.get("/api/auth/profile/my");
  return res.data.data;
};

export const updateMyProfile = async (payload: {
  name?: string;
  email?: string;
  phone?: string;
}) => {
  const res = await apiClient.patch("/api/auth/profile/my", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
  });

  return res.data.data;
};

export interface AssignableManager {
  id: string;
  fullname: string;
  email: string;
}

export const getAssignableManagers = async (
  companyId: string,
): Promise<AssignableManager[]> => {
  const res = await apiClient.get(
    `/api/internal/companies/${companyId}/managers/assignable`,
  );

  return res.data.data;
};
