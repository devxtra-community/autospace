import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

if (!BASE_URL) {
  throw new Error("base url in env not defined");
}

const apiClient = axios.create({
  baseURL: BASE_URL,

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(" API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// type AuthErrorResponse = {
//   code?: string;
//   message?: string;
// };

// Response interceptor - handle token refresh
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log(" API Response:", response.status, response.config.url);
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     console.log(" API Error:", error.response?.status, error.config?.url);

//     // Only handle 401 errors
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(() => apiClient(originalRequest));
//       }

//       isRefreshing = true;

//       try {
//         await apiClient.post(
//           "/api/auth/refresh",
//           {},
//           { withCredentials: true },
//         );
//         processQueue(null);
//         return apiClient(originalRequest);
//       } catch (err) {
//         processQueue(err as Error);
//         window.location.href = "/login";
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // handle rejected user
//     if (error.response?.status === 403) {
//       window.location.href = "/login?reason=rejected";
//       return Promise.reject(error);
//     }

//     return Promise.reject(error);
//   },
// );

apiClient.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = axiosError.response?.status;
    const url = axiosError.config?.url;

    // Prevent refresh loop
    if (url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    // ---------- 401 HANDLING ----------
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await apiClient.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);

        const skipRedirect =
          (originalRequest as { skipRedirect?: boolean }).skipRedirect ===
            true ||
          (typeof originalRequest.headers?.get === "function"
            ? originalRequest.headers.get("x-skip-redirect") === "true"
            : (originalRequest.headers as Record<string, unknown>)?.[
                "x-skip-redirect"
              ] === "true");

        if (!skipRedirect) {
          toast.error("Please login to continue");

          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.href =
                "/login?redirect=" + window.location.pathname;
            }, 3000);
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ---------- REJECTED USER ----------
    if (status === 403) {
      toast.error("Your account is not allowed to access this feature");

      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login?reason=rejected";
        }, 3000);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// now dont set refresh token after Login flow is done ,Protected route exists (/dashboard) ,/me or /profile API exists ,Backend refresh endpoint is stable
// set the refresh token
