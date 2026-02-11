import apiClient from "@/lib/apiClient";

export const getGarageImages = async (garageId: string) => {
  const res = await apiClient.get(`/api/garages/${garageId}/images`);
  return res.data;
};

export const getUploadUrl = async (file: File) => {
  const res = await apiClient.post("/api/files/upload", {
    filename: file.name,
  });

  return res.data as {
    uploadUrl: string;
    key: string;
  };
};

export const uploadToR2 = async (uploadUrl: string, file: File) => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
  });

  if (!res.ok) {
    throw new Error("R2 upload failed");
  }
};

export const attachGarageImage = async (garageId: string, fileId: string) => {
  const res = await apiClient.post(`/api/garages/${garageId}/images`, {
    fileId,
  });

  return res.data;
};
