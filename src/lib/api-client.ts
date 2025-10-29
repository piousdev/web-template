"use client";

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import axiosRetry from "axios-retry";

// Create axios instance with optimized settings for production
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000, // 10 seconds - optimal for client requests at scale
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure retry logic with exponential backoff
axiosRetry(apiClient, {
  retries: 3, // Retry failed requests up to 3 times
  retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, _error, requestConfig) => {
    console.log(`Retrying request (${retryCount}/3):`, requestConfig.url);
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }

    // Log error for debugging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  },
);

// Typed API methods for common operations
export const api = {
  /**
   * GET request
   * @param url Endpoint URL
   * @param config Optional axios config
   */
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.get<T>(url, config);
  },

  /**
   * POST request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiClient.post<T>(url, data, config);
  },

  /**
   * PUT request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiClient.put<T>(url, data, config);
  },

  /**
   * PATCH request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiClient.patch<T>(url, data, config);
  },

  /**
   * DELETE request
   * @param url Endpoint URL
   * @param config Optional axios config
   */
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete<T>(url, config);
  },
};

export default apiClient;
