/**
 * Authentication and Session TypeScript Types
 * Types related to authentication, authorization, and session management
 *
 * Note: Request types are mutable (user input), response/entity types are readonly (immutable data)
 */

import type { auth } from "@/lib/auth";
import type { ActionResult, ID, Timestamps } from "./common.types";

/**
 * Infer session type from Better Auth
 * This includes both session and user properties
 */
export type Session = typeof auth.$Infer.Session;

/**
 * User type from Better Auth session
 */
export type SessionUser = Session["user"];

/**
 * Session data type
 */
export type SessionData = Session["session"];

/**
 * Authentication status
 */
export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

/**
 * Authentication result (readonly - response data)
 */
export type AuthResult = {
  readonly success: boolean;
  readonly session: Session | null;
  readonly user: SessionUser | null;
  readonly error?: string;
};

/**
 * Sign in credentials (mutable - request data)
 */
export type SignInCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/**
 * Sign up credentials (mutable - request data)
 */
export type SignUpCredentials = {
  email: string;
  password: string;
  name?: string;
  acceptTerms?: boolean;
};

/**
 * Password reset request (mutable - request data)
 */
export type PasswordResetRequest = {
  email: string;
};

/**
 * Password reset confirmation (mutable - request data)
 */
export type PasswordResetConfirmation = {
  token: string;
  password: string;
  confirmPassword: string;
};

/**
 * Change password request (mutable - request data)
 */
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * Email verification request (mutable - request data)
 */
export type EmailVerificationRequest = {
  token: string;
};

/**
 * Social provider types
 */
export type SocialProvider =
  | "google"
  | "github"
  | "facebook"
  | "twitter"
  | "apple";

/**
 * Social auth request (mutable - request data)
 */
export type SocialAuthRequest = {
  provider: SocialProvider;
  callbackUrl?: string;
};

/**
 * User role types
 */
export type UserRole = "user" | "admin" | "moderator" | "editor";

/**
 * Permission types
 */
export type Permission =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "posts:read"
  | "posts:write"
  | "posts:delete"
  | "comments:read"
  | "comments:write"
  | "comments:delete"
  | "settings:read"
  | "settings:write"
  | "admin:access";

/**
 * User with role and permissions (readonly - entity data)
 */
export type AuthorizedUser = Readonly<
  SessionUser & {
    role?: UserRole;
    permissions?: readonly Permission[];
  }
>;

/**
 * Authentication token types
 */
export type TokenType =
  | "access"
  | "refresh"
  | "email_verification"
  | "password_reset";

/**
 * Authentication token (readonly - entity data)
 */
export type AuthToken = Readonly<
  {
    id: ID;
    userId: ID;
    type: TokenType;
    token: string;
    expiresAt: Date;
  } & Timestamps
>;

/**
 * Account connection (readonly - entity data)
 */
export type AccountConnection = Readonly<
  {
    id: ID;
    userId: ID;
    provider: SocialProvider;
    providerAccountId: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  } & Timestamps
>;

/**
 * Two-factor authentication settings (readonly - entity data)
 */
export type TwoFactorSettings = {
  readonly enabled: boolean;
  readonly method?: "app" | "sms" | "email";
  readonly verified: boolean;
};

/**
 * Authentication state (readonly - state data)
 */
export type AuthState = {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly user: SessionUser | null;
  readonly error: string | null;
};

/**
 * Sign in action result (readonly - response data)
 */
export type SignInResult = ActionResult<AuthResult>;

/**
 * Sign up action result (readonly - response data)
 */
export type SignUpResult = ActionResult<AuthResult>;

/**
 * Sign out action result (readonly - response data)
 */
export type SignOutResult = ActionResult<{ readonly success: boolean }>;

/**
 * Password reset action result (readonly - response data)
 */
export type PasswordResetResult = ActionResult<{ readonly emailSent: boolean }>;

/**
 * Email verification result (readonly - response data)
 */
export type EmailVerificationResult = ActionResult<{
  readonly verified: boolean;
}>;

/**
 * Session refresh result (readonly - response data)
 */
export type SessionRefreshResult = ActionResult<AuthResult>;

/**
 * Authentication hooks return type
 */
export type UseAuthReturn = {
  readonly session: Session | null;
  readonly user: SessionUser | null;
  readonly status: AuthStatus;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly signIn: (credentials: SignInCredentials) => Promise<SignInResult>;
  readonly signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>;
  readonly signOut: () => Promise<SignOutResult>;
  readonly resetPassword: (
    request: PasswordResetRequest,
  ) => Promise<PasswordResetResult>;
  readonly updatePassword: (
    request: ChangePasswordRequest,
  ) => Promise<ActionResult>;
  readonly verifyEmail: (
    request: EmailVerificationRequest,
  ) => Promise<EmailVerificationResult>;
};

/**
 * Authentication context type
 */
export type AuthContextType = UseAuthReturn;

/**
 * Route protection config
 */
export type RouteProtectionConfig = {
  readonly requireAuth: boolean;
  readonly allowedRoles?: readonly UserRole[];
  readonly requiredPermissions?: readonly Permission[];
  readonly redirectTo?: string;
};

/**
 * Protected route metadata
 */
export type ProtectedRoute = {
  readonly path: string;
  readonly config: RouteProtectionConfig;
};

/**
 * Session metadata (readonly - entity data)
 */
export type SessionMetadata = {
  readonly userAgent?: string;
  readonly ip?: string;
  readonly device?: string;
  readonly location?: {
    readonly country?: string;
    readonly city?: string;
  };
};

/**
 * Login attempt (readonly - entity data)
 */
export type LoginAttempt = Readonly<{
  id: ID;
  email: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  attemptedAt: Date;
}>;

/**
 * Security event types
 */
export type SecurityEventType =
  | "login"
  | "logout"
  | "password_change"
  | "password_reset_request"
  | "password_reset_complete"
  | "email_verification"
  | "account_locked"
  | "suspicious_activity";

/**
 * Security event (readonly - entity data)
 */
export type SecurityEvent = Readonly<
  {
    id: ID;
    userId: ID;
    type: SecurityEventType;
    metadata?: SessionMetadata;
  } & Timestamps
>;
