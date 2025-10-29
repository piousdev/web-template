/**
 * Types Barrel Export
 * Central export point for all TypeScript types
 *
 * Usage:
 * import type { User, ActionResult, ApiResponse } from '@/types';
 */

// API types
export type {
  ApiClientConfig,
  // API endpoints
  ApiEndpoint,
  // Error types
  ApiError,
  ApiErrorResponse,
  // Health & CORS
  ApiHealthStatus,
  ApiPaginatedResponse,
  ApiRouteMap,
  ApiSuccessResponse,
  // Batch requests
  BatchRequest,
  BatchResponse,
  CorsConfig,
  DownloadProgressEvent,
  ErrorInterceptor,
  FetchOptions,
  FileUploadRequest,
  FileUploadResponse,
  GraphQLError,
  GraphQLRequest,
  GraphQLResponse,
  // GraphQL
  GraphQLVariables,
  HttpRequestConfig,
  HttpResponse,
  // Rate limiting
  RateLimitInfo,
  // HTTP types
  RequestHeaders,
  RequestInterceptor,
  ResponseHeaders,
  ResponseInterceptor,
  // Retry & interceptors
  RetryPolicy,
  // Upload/Download
  UploadProgressEvent,
  WebSocketConfig,
  WebSocketMessage,
  // WebSocket
  WebSocketMessageType,
  WebSocketState,
} from "./api.types";

// Authentication types
export type {
  AccountConnection,
  AuthContextType,
  AuthorizedUser,
  AuthResult,
  // State types
  AuthState,
  AuthStatus,
  AuthToken,
  ChangePasswordRequest,
  EmailVerificationRequest,
  EmailVerificationResult,
  LoginAttempt,
  PasswordResetConfirmation,
  PasswordResetRequest,
  PasswordResetResult,
  Permission,
  ProtectedRoute,
  // Route protection
  RouteProtectionConfig,
  SecurityEvent,
  SecurityEventType,
  // Session types
  Session,
  SessionData,
  // Security
  SessionMetadata,
  SessionRefreshResult,
  SessionUser,
  // Credential types
  SignInCredentials,
  // Action results
  SignInResult,
  SignOutResult,
  SignUpCredentials,
  SignUpResult,
  SocialAuthRequest,
  // Social auth
  SocialProvider,
  // Token types
  TokenType,
  // 2FA
  TwoFactorSettings,
  // Hooks
  UseAuthReturn,
  // Authorization
  UserRole,
} from "./auth.types";
// Common types
export type {
  ActionResult,
  // Function types
  AnyFunction,
  // Response wrappers
  ApiResponse,
  AppError,
  ArrayElement,
  AsyncFunction,
  BaseEntity,
  Breadcrumb,
  Callback,
  Class,
  Constructor,
  // Query types
  DateRange,
  DeepPartial,
  DeepReadonly,
  Dictionary,
  EnumToUnion,
  Environment,
  EventHandler,
  // Form types
  FieldError,
  // File types
  FileMetadata,
  Filter,
  FilterOperator,
  HttpMethod,
  // IDs
  ID,
  JsonObject,
  // JSON types
  JsonPrimitive,
  JsonValue,
  // Misc
  KeyValuePair,
  LoadingState,
  Locale,
  MaybePromise,
  MenuItem,
  Mutable,
  NonNullable,
  // UI types
  Notification,
  NotificationType,
  // Utility types
  Nullable,
  OmitByValue,
  Optional,
  OptionalFields,
  PaginatedResponse,
  PaginationParams,
  PickByValue,
  QueryParams,
  RequireFields,
  SoftDelete,
  SortDirection,
  SortOrder,
  // Status types
  Status,
  TableColumn,
  Theme,
  // Entity types
  Timestamps,
  Toast,
  UUID,
  ValidationResult,
} from "./common.types";

// Payment types (Polar)
export type {
  ApplyDiscountRequest,
  ApplyDiscountResult,
  BillingInterval,
  // Billing portal
  BillingPortalSession,
  CancelSubscriptionRequest,
  CancelSubscriptionResult,
  // Checkout
  CheckoutSession,
  CreateBillingPortalSessionRequest,
  CreateBillingPortalSessionResult,
  CreateCheckoutSessionRequest,
  // Action results
  CreateCheckoutSessionResult,
  CreateRefundRequest,
  CreateRefundResult,
  CreateSubscriptionResult,
  // Currency
  Currency,
  // Customer
  Customer,
  // Discounts
  Discount,
  GetInvoicesResult,
  GetPaymentsResult,
  GetSubscriptionResult,
  // Invoices
  Invoice,
  InvoiceLineItem,
  Money,
  // Payment
  Payment,
  PaymentIntent,
  PaymentMethod,
  // Payment methods
  PaymentMethodType,
  // Stats
  PaymentStats,
  // Status types
  PaymentStatus,
  // Webhooks
  PolarWebhookEvent,
  PolarWebhookPayload,
  Price,
  PriceType,
  // Product & pricing
  Product,
  ProductWithPrices,
  // Refunds
  Refund,
  // Subscription
  Subscription,
  SubscriptionChangeRequest,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionWithDetails,
  // Usage
  UsageRecord,
} from "./payment.types";
// User types
export type {
  AcceptInviteRequest,
  // Account status
  AccountStatus,
  // User relationships
  BlockedUser,
  CompleteUser,
  // User requests
  CreateUserRequest,
  // User action results
  CreateUserResult,
  DeleteUserRequest,
  DeleteUserResult,
  GetUserResult,
  GetUsersResult,
  SendInviteRequest,
  UpdateAccountStatusRequest,
  UpdatePreferencesRequest,
  UpdatePreferencesResult,
  UpdateProfileRequest,
  UpdateProfileResult,
  UpdateUserRequest,
  UpdateUserResult,
  // User entity
  User,
  UserAccount,
  UserActivity,
  UserExportData,
  UserFollow,
  UserFollowStats,
  // User invites
  UserInvite,
  UserListResponse,
  UserNotification,
  UserPreferences,
  UserProfile,
  // User queries
  UserQueryParams,
  // User search
  UserSearchResult,
  UserSession,
  // User stats
  UserStats,
  UserWithFollowStats,
  UserWithPreferences,
  UserWithProfile,
} from "./user.types";
