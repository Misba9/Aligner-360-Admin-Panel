import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  timeout: 5 * 60 * 1000, // 5 minutes timeout for file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
