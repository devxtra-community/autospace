import apiClient from "@/lib/apiClient";

export const getGarageImages = async (garageId: string) => {
  const res = await apiClient.get(`/api/garages/${garageId}/images`);
  return res.data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post("/api/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const attachGarageImage = async (garageId: string, fileId: string) => {
  const res = await apiClient.post(`/api/garages/${garageId}/images`, {
    fileId,
  });
  return res.data;
};
