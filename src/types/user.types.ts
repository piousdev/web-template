/**
 * User TypeScript Types
 * Types related to user profiles, preferences, and management
 *
 * Note: Request types are mutable (user input), response/entity types are readonly (immutable data)
 */

import type { SessionUser, UserRole } from "./auth.types";
import type {
  ActionResult,
  ID,
  Nullable,
  PaginatedResponse,
  QueryParams,
  Status,
  Timestamps,
} from "./common.types";

/**
 * Base user type (readonly - extends SessionUser from Better Auth)
 */
export type User = Readonly<
  SessionUser & {
    role?: UserRole;
    status?: Status;
    lastLoginAt?: Date;
    emailVerifiedAt?: Date | null;
  }
>;

/**
 * User profile (readonly - entity data)
 */
export type UserProfile = Readonly<
  {
    id: ID;
    userId: ID;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    location?: {
      readonly country?: string;
      readonly city?: string;
      readonly timezone?: string;
    };
    socialLinks?: {
      readonly twitter?: string;
      readonly linkedin?: string;
      readonly github?: string;
      readonly website?: string;
    };
  } & Timestamps
>;

/**
 * User with profile (readonly)
 */
export type UserWithProfile = Readonly<
  User & {
    profile?: UserProfile;
  }
>;

/**
 * User preferences/settings (readonly - entity data)
 */
export type UserPreferences = Readonly<
  {
    id: ID;
    userId: ID;
    theme?: "light" | "dark" | "system";
    language?: string;
    timezone?: string;
    notifications: {
      readonly email: boolean;
      readonly push: boolean;
      readonly sms: boolean;
      readonly marketing: boolean;
    };
    privacy: {
      readonly profileVisibility: "public" | "private" | "friends";
      readonly showEmail: boolean;
      readonly showPhone: boolean;
      readonly searchable: boolean;
    };
  } & Timestamps
>;

/**
 * User with preferences (readonly)
 */
export type UserWithPreferences = Readonly<
  User & {
    preferences?: UserPreferences;
  }
>;

/**
 * Complete user (readonly)
 */
export type CompleteUser = Readonly<
  User & {
    profile?: UserProfile;
    preferences?: UserPreferences;
  }
>;

/**
 * Create user request (mutable - request data)
 */
export type CreateUserRequest = {
  email: string;
  password?: string;
  name?: string;
  role?: UserRole;
};

/**
 * Update user request (mutable - request data)
 */
export type UpdateUserRequest = Partial<{
  name: string;
  email: string;
  image: string;
  role: UserRole;
  status: Status;
}>;

/**
 * Update profile request (mutable - request data)
 */
export type UpdateProfileRequest = Partial<{
  bio: string;
  avatar: string;
  coverImage: string;
  phone: string;
  dateOfBirth: Date;
  gender: UserProfile["gender"];
  location: UserProfile["location"];
  socialLinks: UserProfile["socialLinks"];
}>;

/**
 * Update preferences request (mutable - request data)
 */
export type UpdatePreferencesRequest = Partial<UserPreferences>;

/**
 * User query parameters
 */
export type UserQueryParams = QueryParams<
  "name" | "email" | "createdAt" | "lastLoginAt",
  "name" | "email" | "role" | "status"
>;

/**
 * User list response (readonly)
 */
export type UserListResponse = PaginatedResponse<User>;

/**
 * User statistics (readonly)
 */
export type UserStats = {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly newUsersToday: number;
  readonly newUsersThisWeek: number;
  readonly newUsersThisMonth: number;
  readonly usersByRole: Readonly<Record<UserRole, number>>;
  readonly usersByStatus: Readonly<Record<Status, number>>;
};

/**
 * User activity (readonly - entity data)
 */
export type UserActivity = Readonly<
  {
    id: ID;
    userId: ID;
    type:
      | "login"
      | "logout"
      | "profile_update"
      | "password_change"
      | "settings_change";
    description: string;
    metadata?: Readonly<Record<string, unknown>>;
  } & Timestamps
>;

/**
 * User notification (readonly - entity data)
 */
export type UserNotification = Readonly<
  {
    id: ID;
    userId: ID;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    read: boolean;
    readAt?: Date;
    actionUrl?: string;
  } & Timestamps
>;

/**
 * User session info (readonly - entity data)
 */
export type UserSession = Readonly<
  {
    id: ID;
    userId: ID;
    token: string;
    device?: string;
    browser?: string;
    os?: string;
    ip?: string;
    location?: {
      readonly country?: string;
      readonly city?: string;
    };
    lastActiveAt: Date;
    expiresAt: Date;
  } & Timestamps
>;

/**
 * User deletion request (mutable - request data)
 */
export type DeleteUserRequest = {
  userId: ID;
  reason?: string;
  permanent?: boolean;
};

/**
 * User export data (readonly)
 */
export type UserExportData = {
  readonly user: User;
  readonly profile?: UserProfile;
  readonly preferences?: UserPreferences;
  readonly activities: readonly UserActivity[];
  readonly sessions: readonly UserSession[];
  readonly exportedAt: Date;
};

/**
 * User action results (readonly)
 */
export type CreateUserResult = ActionResult<User>;
export type UpdateUserResult = ActionResult<User>;
export type DeleteUserResult = ActionResult<{ readonly deleted: boolean }>;
export type GetUserResult = ActionResult<User>;
export type GetUsersResult = ActionResult<UserListResponse>;
export type UpdateProfileResult = ActionResult<UserProfile>;
export type UpdatePreferencesResult = ActionResult<UserPreferences>;

/**
 * User invite (readonly - entity data)
 */
export type UserInvite = Readonly<
  {
    id: ID;
    email: string;
    role: UserRole;
    invitedBy: ID;
    token: string;
    expiresAt: Date;
    acceptedAt?: Date;
    status: "pending" | "accepted" | "expired" | "cancelled";
  } & Timestamps
>;

/**
 * User invite request (mutable - request data)
 */
export type SendInviteRequest = {
  email: string;
  role: UserRole;
  message?: string;
};

/**
 * User invite acceptance (mutable - request data)
 */
export type AcceptInviteRequest = {
  token: string;
  name: string;
  password: string;
};

/**
 * Blocked user (readonly - entity data)
 */
export type BlockedUser = Readonly<
  {
    id: ID;
    userId: ID;
    blockedUserId: ID;
    reason?: string;
  } & Timestamps
>;

/**
 * User follow relationship (readonly - entity data)
 */
export type UserFollow = Readonly<
  {
    id: ID;
    followerId: ID;
    followingId: ID;
  } & Timestamps
>;

/**
 * User follow stats (readonly)
 */
export type UserFollowStats = {
  readonly followersCount: number;
  readonly followingCount: number;
};

/**
 * User with follow stats (readonly)
 */
export type UserWithFollowStats = Readonly<User & UserFollowStats>;

/**
 * User search result (readonly)
 */
export type UserSearchResult = {
  readonly id: ID;
  readonly name: string;
  readonly email: string;
  readonly image: Nullable<string>;
  readonly role?: UserRole;
  readonly matchScore?: number;
};

/**
 * Account status types
 */
export type AccountStatus =
  | "active"
  | "suspended"
  | "banned"
  | "deactivated"
  | "pending_verification";

/**
 * User account with status (readonly - entity data)
 */
export type UserAccount = Readonly<
  User & {
    accountStatus: AccountStatus;
    suspendedUntil?: Date;
    suspensionReason?: string;
    bannedAt?: Date;
    banReason?: string;
  }
>;

/**
 * Update account status request (mutable - request data)
 */
export type UpdateAccountStatusRequest = {
  userId: ID;
  status: AccountStatus;
  reason?: string;
  duration?: number;
};
