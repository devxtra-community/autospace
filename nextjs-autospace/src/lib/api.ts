import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("base url in env not defined");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// TODO (Milestone 1):
// - Add auth token interceptor
// - Add response error handling
