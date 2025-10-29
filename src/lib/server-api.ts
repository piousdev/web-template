import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import axiosRetry from "axios-retry";

// Create axios instance for server-side API calls
const serverApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000, // 10 seconds for server-to-server communication
  headers: {
    "Content-Type": "application/json",
    "X-Internal-API-Key": process.env.INTERNAL_API_KEY || "development-key",
  },
});

// Configure retry logic with exponential backoff
axiosRetry(serverApi, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, _error, requestConfig) => {
    console.warn(
      `[Server API] Retrying request (${retryCount}/3):`,
      requestConfig.url,
    );
  },
});

// Request interceptor for logging (server-side)
serverApi.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Server API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("[Server API] Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
serverApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log detailed error information
    console.error("[Server API] Response error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });

    return Promise.reject(error);
  },
);

// Typed API methods for server-side operations
export const serverApiClient = {
  /**
   * GET request
   * @param url Endpoint URL
   * @param config Optional axios config
   */
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return serverApi.get<T>(url, config);
  },

  /**
   * POST request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return serverApi.post<T>(url, data, config);
  },

  /**
   * PUT request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return serverApi.put<T>(url, data, config);
  },

  /**
   * PATCH request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional axios config
   */
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return serverApi.patch<T>(url, data, config);
  },

  /**
   * DELETE request
   * @param url Endpoint URL
   * @param config Optional axios config
   */
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return serverApi.delete<T>(url, config);
  },
};

export default serverApi;
