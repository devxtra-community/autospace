import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

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

type AuthErrorResponse = {
  code?: string;
  message?: string;
};

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(" API Response:", response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log(" API Error:", error.response?.status, error.config?.url);

    // Only handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorData = error.response.data as AuthErrorResponse | undefined;

      // Check for token expired error
      const isTokenExpired =
        errorData?.code === "TOKEN_EXPIRED" ||
        errorData?.message?.includes("expired") ||
        errorData?.message?.includes("Token has expired");

      if (isTokenExpired) {
        console.log(" Access token expired, attempting refresh...");

        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log("⏳ Refresh in progress, queuing request...");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              console.log(" Retrying queued request");
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log(" Calling refresh endpoint...");

          // Call refresh endpoint
          // const response = await axios.post(
          //   `${BASE_URL}/api/auth/refresh`,
          //   {},
          //   {
          //     withCredentials: true, // Send refresh token cookie
          //   }
          // );

          console.log("Token refreshed successfully");

          isRefreshing = false;
          processQueue(null);

          // Retry the original request
          console.log(" Retrying original request");
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error(" Token refresh failed:", refreshError);

          isRefreshing = false;
          processQueue(refreshError as Error, null);

          // Redirect to login
          if (typeof window !== "undefined") {
            console.log(" Redirecting to login...");
            // Clear any stored data
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// now dont set refresh token after Login flow is done ,Protected route exists (/dashboard) ,/me or /profile API exists ,Backend refresh endpoint is stable
// set the refresh token
