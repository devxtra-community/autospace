import apiClient from "@/lib/apiClient";
import publicApiClient from "@/lib/publicApiClient";
import type { ApiGarageImage } from "@/types/garage-images";

type GarageImagesResponse = {
  data: ApiGarageImage[];
};

export const getGarageImages = async (garageId: string) => {
  const res = await publicApiClient.get<GarageImagesResponse>(
    `/api/public/garages/${garageId}/images`,
  );

  const data = res.data.data;

  return data.map((img: ApiGarageImage) => ({
    id: img.id,
    url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${img.file.key}`,
  }));
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
