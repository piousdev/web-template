/**
 * API TypeScript Types
 * Types for API requests, responses, and HTTP interactions
 *
 * Note: Request types are mutable (user input), response types are readonly (immutable data)
 */

import type { HttpMethod, PaginatedResponse } from "./common.types";

/**
 * API error response (readonly)
 */
export type ApiError = {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
  readonly path?: string;
};

/**
 * API success response (readonly)
 */
export type ApiSuccessResponse<T = unknown> = {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
};

/**
 * API error response wrapper (readonly)
 */
export type ApiErrorResponse = {
  readonly success: false;
  readonly error: ApiError;
};

/**
 * Combined API response (readonly)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * API paginated response (readonly)
 */
export type ApiPaginatedResponse<T> = {
  readonly success: true;
  readonly data: PaginatedResponse<T>;
};

/**
 * HTTP headers (mutable for request, readonly for response)
 */
export type RequestHeaders = Record<string, string>;
export type ResponseHeaders = Readonly<Record<string, string>>;

/**
 * HTTP request config (mutable - request data)
 */
export type HttpRequestConfig = {
  method?: HttpMethod;
  headers?: RequestHeaders;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
};

/**
 * HTTP response (readonly - response data)
 */
export type HttpResponse<T = unknown> = {
  readonly data: T;
  readonly status: number;
  readonly statusText: string;
  readonly headers: ResponseHeaders;
  readonly config: Readonly<HttpRequestConfig>;
};

/**
 * Fetch options (mutable - request data)
 */
export type FetchOptions = {
  method?: HttpMethod;
  headers?: RequestHeaders;
  body?: BodyInit;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  signal?: AbortSignal;
};

/**
 * API endpoint definition (readonly)
 */
export type ApiEndpoint = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly description?: string;
  readonly requiresAuth?: boolean;
};

/**
 * API route map (readonly)
 */
export type ApiRouteMap = Readonly<Record<string, ApiEndpoint>>;

/**
 * Retry policy configuration (readonly)
 */
export type RetryPolicy = {
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly retryOn?: readonly number[];
  readonly exponentialBackoff?: boolean;
};

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  config: HttpRequestConfig,
) => HttpRequestConfig | Promise<HttpRequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor<T = unknown> = (
  response: HttpResponse<T>,
) => HttpResponse<T> | Promise<HttpResponse<T>>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (error: ApiError) => Promise<never>;

/**
 * API client configuration (readonly)
 */
export type ApiClientConfig = {
  readonly baseURL: string;
  readonly timeout?: number;
  readonly headers?: ResponseHeaders;
  readonly withCredentials?: boolean;
  readonly retryPolicy?: RetryPolicy;
  readonly requestInterceptors?: readonly RequestInterceptor[];
  readonly responseInterceptors?: readonly ResponseInterceptor[];
  readonly errorInterceptors?: readonly ErrorInterceptor[];
};

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | "connection"
  | "disconnection"
  | "message"
  | "notification"
  | "error"
  | "ping"
  | "pong";

/**
 * WebSocket message (readonly)
 */
export type WebSocketMessage<T = unknown> = {
  readonly type: WebSocketMessageType;
  readonly data: T;
  readonly timestamp: string;
  readonly id?: string;
};

/**
 * WebSocket connection state
 */
export type WebSocketState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "reconnecting"
  | "error";

/**
 * WebSocket configuration (readonly)
 */
export type WebSocketConfig = {
  readonly url: string;
  readonly protocols?: readonly string[];
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
  readonly heartbeatInterval?: number;
};

/**
 * Upload progress event (readonly)
 */
export type UploadProgressEvent = {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
  readonly timestamp: string;
};

/**
 * Download progress event (readonly)
 */
export type DownloadProgressEvent = {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
  readonly timestamp: string;
};

/**
 * File upload request (mutable - request data)
 */
export type FileUploadRequest = {
  file: File;
  fieldName?: string;
  metadata?: Record<string, string>;
  onProgress?: (event: UploadProgressEvent) => void;
};

/**
 * File upload response (readonly - response data)
 */
export type FileUploadResponse = {
  readonly url: string;
  readonly key: string;
  readonly size: number;
  readonly contentType: string;
  readonly uploadedAt: string;
};

/**
 * Batch request (mutable - request data)
 */
export type BatchRequest = {
  requests: readonly {
    readonly id: string;
    readonly endpoint: string;
    readonly method: HttpMethod;
    readonly data?: unknown;
  }[];
};

/**
 * Batch response (readonly - response data)
 */
export type BatchResponse<T = unknown> = {
  readonly responses: readonly {
    readonly id: string;
    readonly success: boolean;
    readonly data?: T;
    readonly error?: ApiError;
  }[];
};

/**
 * GraphQL query variables (mutable - request data)
 */
export type GraphQLVariables = Record<string, unknown>;

/**
 * GraphQL request (mutable - request data)
 */
export type GraphQLRequest = {
  query: string;
  variables?: GraphQLVariables;
  operationName?: string;
};

/**
 * GraphQL error (readonly)
 */
export type GraphQLError = {
  readonly message: string;
  readonly locations?: readonly {
    readonly line: number;
    readonly column: number;
  }[];
  readonly path?: readonly (string | number)[];
  readonly extensions?: Readonly<Record<string, unknown>>;
};

/**
 * GraphQL response (readonly - response data)
 */
export type GraphQLResponse<T = unknown> = {
  readonly data?: T;
  readonly errors?: readonly GraphQLError[];
};

/**
 * Rate limit information (readonly)
 */
export type RateLimitInfo = {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: string;
  readonly retryAfter?: number;
};

/**
 * API health status (readonly)
 */
export type ApiHealthStatus = {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly timestamp: string;
  readonly version?: string;
  readonly uptime?: number;
  readonly checks?: Readonly<Record<string, boolean>>;
};

/**
 * CORS configuration (readonly)
 */
export type CorsConfig = {
  readonly origin: string | readonly string[] | boolean;
  readonly methods?: readonly HttpMethod[];
  readonly allowedHeaders?: readonly string[];
  readonly exposedHeaders?: readonly string[];
  readonly credentials?: boolean;
  readonly maxAge?: number;
};
