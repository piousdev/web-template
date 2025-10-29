// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: "auth_token",
  SESSION_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_THRESHOLD: 24 * 60 * 60, // Refresh if less than 1 day left
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  DAY: 24 * 60 * 60, // 24 hours
  WEEK: 7 * 24 * 60 * 60, // 7 days
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  // API endpoint rate limits (requests per window)
  API_DEFAULT: {
    limit: 100,
    window: 60, // 1 minute
  },
  API_AUTH: {
    limit: 5,
    window: 60, // 1 minute
  },
  API_SEARCH: {
    limit: 20,
    window: 60, // 1 minute
  },
  // Client-side rate limits
  CLIENT_ACTIONS: {
    limit: 10,
    window: 10, // 10 seconds
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Socket.io Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "connect_error",

  // Rooms
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",

  // Messages
  MESSAGE: "message",
  MESSAGE_SENT: "message-sent",
  MESSAGE_RECEIVED: "message-received",

  // Notifications
  NOTIFICATION: "notification",
  NOTIFICATION_READ: "notification-read",

  // User Status
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  USER_TYPING: "user-typing",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  RATE_LIMIT: "Too many requests. Please try again later.",
  SERVER_ERROR: "Server error. Please try again later.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Changes saved successfully.",
  DELETED: "Item deleted successfully.",
  CREATED: "Item created successfully.",
  UPDATED: "Item updated successfully.",
  SENT: "Sent successfully.",
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM DD, YYYY",
  WITH_TIME: "MM/DD/YYYY hh:mm A",
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
} as const;

// Environment
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_TEST: process.env.NODE_ENV === "test",
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: "Next.js Boilerplate",
  DESCRIPTION: "Production-ready Next.js + TypeScript boilerplate",
  URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  SUPPORT_EMAIL: "support@example.com",
} as const;
