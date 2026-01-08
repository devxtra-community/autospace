import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

if (!BASE_URL) {
  throw new Error("base url in env not defined");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, Promise.reject);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data;

    if (apiError?.error?.code) {
      return Promise.reject(apiError);
    }

    return Promise.reject({
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      },
    });
  },
);

// now dont set refresh token after Login flow is done ,Protected route exists (/dashboard) ,/me or /profile API exists ,Backend refresh endpoint is stable
// set the refresh token

// TODO (Milestone 1):
// - Add auth token interceptor
// - Add response error handling
