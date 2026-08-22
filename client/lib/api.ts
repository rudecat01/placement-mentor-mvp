import axios from "axios";

// When running in the browser, prefer same-origin relative URLs so Next.js rewrites proxy to backend
// seamlessly without CORS or IPv6/IPv4 localhost connection issues.
const resolvedBaseURL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "" : "http://127.0.0.1:4000");

export const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 35000,
});

api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor with automatic localhost fallback on direct network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.code === "ERR_NETWORK" || !error.response) &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;
      // If relative URL failed, try explicit localhost:4000 directly
      const url = originalRequest.url || "";
      const fallbackUrl = url.startsWith("http") ? url : `http://localhost:4000${url.startsWith("/") ? "" : "/"}${url}`;
      originalRequest.url = fallbackUrl;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);
