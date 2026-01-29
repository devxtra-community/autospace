import { RegisterApiInput } from "@autospace/shared/auth/register.schema";
import apiClient from "./apiClient";
import type { LoginDto } from "@autospace/shared";

/**
 * Backend response shape (UPDATED)
 * - refreshToken is NOT returned
 * - user is top-level
 */

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    role: "admin" | "owner" | "manager" | "valet" | "customer";
    status: "active" | "pending" | "rejected";
  };
}

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
//   withCredentials: true, //  REQUIRED
// });

export const registerUser = async (
  data: RegisterApiInput,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    data,
  );

  return response.data;
};

export const registerOwner = async (
  data: RegisterApiInput,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/owner/register",
    data,
  );

  return response.data;
};

export const loginUser = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", data);

  return response.data;
};

export const getMe = () => {
  return apiClient.get<AuthResponse>("/api/auth/me");
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post("/api/auth/logout");
  } finally {
    window.location.href = "/login";
  }
};
