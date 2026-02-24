import apiClient from "@/lib/apiClient";
export interface GetMyGaragesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  managerFilter?: "assigned" | "unassigned";
}

export const createGarage = async (payload: {
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  capacity: number;
  images?: string[];
  description?: string;
}) => {
  const res = await apiClient.post("/api/garages/register", payload);

  return res.data.data;
};

export const getMyGarages = async (
  companyId: string,
  page = 1,
  limit = 6,
  search?: string,
  status?: string,
  managerFilter?: "assigned" | "unassigned",
) => {
  const params: GetMyGaragesParams = {
    page,
    limit,
  };

  if (search) params.search = search;

  if (status) params.status = status;

  if (managerFilter) params.managerFilter = managerFilter;

  const res = await apiClient.get(`/api/garages/byCompany/${companyId}`, {
    params,
  });

  return res.data;
};

export const getMyManagerGarage = async () => {
  const res = await apiClient.get("/api/garages/manager/my");

  return res.data.data;
};

export const getGarageById = async (garageId: string) => {
  const res = await apiClient.get(`/api/garages/${garageId}`);

  return res.data.data;
};

export const updateGarageProfile = async (
  garageId: string,
  data: {
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    valetAvailable?: boolean;
    capacity?: number;
  },
) => {
  const res = await apiClient.put(`/api/garages/${garageId}`, data);

  return res.data.data;
};

export const assignManagerToGarage = async (payload: {
  garageCode: string;
  managerId: string;
}) => {
  const res = await apiClient.post("/api/garages/assign-manager", payload);

  return res.data.data;
};

export const createGarageFloor = async (payload: { floorNumber: number }) => {
  const res = await apiClient.post("/api/garages/floors", payload);

  return res.data.data;
};

export const getMyGarageFloors = async () => {
  const res = await apiClient.get("/api/garages/floors/my");

  return res.data.data;
};

export const createGarageSlot = async (payload: {
  floorNumber: number;
  slotNumber: string;
  slotSize: "STANDARD" | "LARGE";
}) => {
  const res = await apiClient.post("/api/garages/slots", payload);

  return res.data.data;
};

export const getMyGarageSlots = async () => {
  const res = await apiClient.get("/api/garages/slots/my");

  return res.data.data;
};

export const getSlotsByFloor = async (floorId: string) => {
  const res = await apiClient.get(`/api/garages/floors/${floorId}/slots`);

  return res.data.data;
};
