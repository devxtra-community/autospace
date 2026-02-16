import apiClient from "@/lib/apiClient";

export const getMyValet = async () => {
  const res = await apiClient.get("/api/valets/me");
  return res.data?.data;
};
