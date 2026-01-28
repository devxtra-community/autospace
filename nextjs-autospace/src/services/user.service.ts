import { api } from "@/lib/auth.api";

export const getMyProfile = async () => {
  const res = await api.get("/api/auth/profile/my");
  return res.data.data;
};

export const updateMyProfile = async (payload: {
  name?: string;
  email?: string;
  phone?: string;
}) => {
  const res = await api.patch("/api/auth/profile/my", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
  });

  return res.data.data;
};
