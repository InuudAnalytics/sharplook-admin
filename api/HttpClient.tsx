import axios from "axios";
import "../vite-env.d.ts";

const getToken = () => {
  return localStorage.getItem("token");
};


export const HttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests dynamically
HttpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 403 errors globally
HttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Create and dispatch a custom event for 403 errors
      const unauthorizedEvent = new CustomEvent("unauthorized", {
        detail: {
          message:
            "You are not authorized to view this page. Please contact your administrator if you believe this is an error.",
          status: 403,
        },
      });
      window.dispatchEvent(unauthorizedEvent);
    }
    return Promise.reject(error);
  }
);
