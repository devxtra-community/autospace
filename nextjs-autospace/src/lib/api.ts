import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

if (!BASE_URL) {
  throw new Error("base url in env not defined");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,

  withCredentials: true,
});

// now dont set refresh token after Login flow is done ,Protected route exists (/dashboard) ,/me or /profile API exists ,Backend refresh endpoint is stable
// set the refresh token
