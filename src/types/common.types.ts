/**
 * Common TypeScript Types and Utilities
 * Shared types used across the application
 */

/**
 * Generic API response wrapper
 */
export type ApiResponse<T = unknown> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
};

/**
 * Paginated response wrapper
 */
export type PaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

/**
 * Generic action result (for server actions)
 */
export type ActionResult<T = unknown> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
};

/**
 * Generic error type
 */
export type AppError = {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly statusCode?: number;
};

/**
 * File upload metadata
 */
export type FileMetadata = {
  readonly key: string;
  readonly url: string;
  readonly bucket: string;
  readonly size: number;
  readonly contentType: string;
  readonly uploadedAt: Date;
};

/**
 * Date range filter
 */
export type DateRange = {
  readonly from: Date;
  readonly to: Date;
};

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort order
 */
export type SortOrder<T extends string = string> = {
  readonly field: T;
  readonly direction: SortDirection;
};

/**
 * Filter operator types
 */
export type FilterOperator =
  | "eq" // Equal
  | "ne" // Not equal
  | "gt" // Greater than
  | "gte" // Greater than or equal
  | "lt" // Less than
  | "lte" // Less than or equal
  | "in" // In array
  | "nin" // Not in array
  | "like" // Like (string matching)
  | "ilike"; // Case-insensitive like

/**
 * Generic filter
 */
export type Filter<T extends string = string> = {
  readonly field: T;
  readonly operator: FilterOperator;
  readonly value: unknown;
};

/**
 * Pagination parameters
 */
export type PaginationParams = {
  readonly page: number;
  readonly limit: number;
};

/**
 * Query parameters with pagination, sorting, and filtering
 */
export type QueryParams<
  TSortField extends string = string,
  TFilterField extends string = string,
> = {
  readonly pagination?: PaginationParams;
  readonly sort?: SortOrder<TSortField>;
  readonly filters?: readonly Filter<TFilterField>[];
  readonly search?: string;
};

/**
 * ID types
 */
export type ID = string;
export type UUID = string;

/**
 * Timestamp fields
 */
export type Timestamps = {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * Soft delete fields
 */
export type SoftDelete = {
  readonly deletedAt: Date | null;
};

/**
 * Entity with all common fields
 */
export type BaseEntity = {
  readonly id: ID;
} & Timestamps;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper (for partial updates)
 */
export type Optional<T> = T | undefined;

/**
 * Make specific fields required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific fields optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Exclude null from type
 */
export type NonNullable<T> = Exclude<T, null>;

/**
 * Deep partial (makes all nested properties optional)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly (makes all nested properties readonly)
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract type from array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Make properties mutable (remove readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Pick by value type
 */
export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>;

/**
 * Omit by value type
 */
export type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;

/**
 * Function type helper
 */
export type AnyFunction = (...args: never[]) => unknown;

/**
 * Async function type helper
 */
export type AsyncFunction<T = unknown> = (
  ...args: readonly unknown[]
) => Promise<T>;

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Callback type
 */
export type Callback<T = void> = () => T;

/**
 * Promise or value (for functions that can be sync or async)
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * JSON value types
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

/**
 * Status types
 */
export type Status = "active" | "inactive" | "pending" | "archived";

/**
 * Loading state
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Theme type
 */
export type Theme = "light" | "dark" | "system";

/**
 * Locale type
 */
export type Locale = "en" | "es" | "fr" | "de" | "zh" | "ja";

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Environment types
 */
export type Environment = "development" | "production" | "test" | "staging";

/**
 * Notification type
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Notification
 */
export type Notification = {
  readonly id: ID;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly duration?: number;
  readonly createdAt: Date;
};

/**
 * Toast notification (simpler version)
 */
export type Toast = {
  readonly id: ID;
  readonly type: NotificationType;
  readonly message: string;
  readonly duration?: number;
};

/**
 * Breadcrumb item
 */
export type Breadcrumb = {
  readonly label: string;
  readonly href?: string;
  readonly current?: boolean;
};

/**
 * Menu item
 */
export type MenuItem = {
  readonly id: ID;
  readonly label: string;
  readonly href?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly children?: readonly MenuItem[];
};

/**
 * Table column definition
 */
export type TableColumn<T = unknown> = {
  readonly key: string;
  readonly label: string;
  readonly sortable?: boolean;
  readonly render?: (value: unknown, row: T) => React.ReactNode;
  readonly width?: string;
};

/**
 * Form field error
 */
export type FieldError = {
  readonly field: string;
  readonly message: string;
};

/**
 * Validation result
 */
export type ValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly FieldError[];
};

/**
 * Key-value pair
 */
export type KeyValuePair<
  K extends string | number | symbol = string,
  V = unknown,
> = {
  readonly key: K;
  readonly value: V;
};

/**
 * Dictionary/Map type
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Enum to union type
 */
export type EnumToUnion<T extends Record<string, string | number>> = T[keyof T];

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (...args: readonly unknown[]) => T;

/**
 * Class type
 */
export type Class<T = unknown> = Constructor<T> & { readonly prototype: T };
