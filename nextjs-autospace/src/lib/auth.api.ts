import { RegisterApiInput } from "@autospace/shared/auth/register.schema";
import { apiClient } from "./api";
import type { LoginDto } from "@autospace/shared";

/**
 * Backend response shape (UPDATED)
 * - refreshToken is NOT returned
 * - user is top-level
 */

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
  user: {
    id: string;
    email: string;
    role: string;
    status: "pending" | "active" | "inactive" | "rejected";
  };
}

export const registerUser = async (
  data: RegisterApiInput,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    data,
  );

  return response.data;
};

export const loginUser = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", data);

  // ✅ ONLY store access token
  localStorage.setItem("accessToken", response.data.data.accessToken);

  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Backend should clear refresh token cookie
    await apiClient.post("/api/auth/logout");
  } finally {
    // ✅ Remove ONLY access token
    localStorage.removeItem("accessToken");
  }
};
