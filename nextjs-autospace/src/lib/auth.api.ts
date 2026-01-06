import { apiClient } from "./api";
import type { UserRegisterDto, LoginDto } from "@autospace/shared";

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      status: "pending" | "active" | "inactive" | "rejected";
    };
    accessToken: string;
    refreshToken: string;
  };
}

// interface ApiError {
//   success: false;
//   message: string;
//   errors?: Record<string, string>;
// }

export const registerUser = async (
  data: UserRegisterDto,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    data,
  );
  return response.data;
};

export const loginUser = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post("api/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};
