import { headers } from "next/headers";
import { auth, type Session } from "@/lib/auth";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  user?: Session["user"];
  error?: string;
}

export interface SessionResult {
  session: Session | null;
  user: Session["user"] | null;
}

/**
 * Get current session (server-side)
 * Must be called from server components or server actions
 */
export async function getSession(): Promise<SessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return {
        session: null,
        user: null,
      };
    }

    return {
      session,
      user: session.user,
    };
  } catch (error) {
    console.error("[Auth Service] Error getting session:", error);
    return {
      session: null,
      user: null,
    };
  }
}

/**
 * Sign up a new user
 * Must be called from server actions
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const headersList = await headers();
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      headers: headersList,
    });

    if (!result || "error" in result) {
      return {
        success: false,
        error:
          (result && "error" in result && typeof result.error === "string"
            ? result.error
            : undefined) || "Sign up failed",
      };
    }

    // Better Auth returns { user, token }, not a full session
    // We need to get the session separately after successful sign up
    const sessionData = await getSession();

    return {
      success: true,
      session: sessionData.session || undefined,
      user: sessionData.user || undefined,
    };
  } catch (error) {
    console.error("[Auth Service] Error signing up:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

/**
 * Sign in an existing user
 * Must be called from server actions
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const headersList = await headers();
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      headers: headersList,
    });

    if (!result || "error" in result) {
      return {
        success: false,
        error:
          (result && "error" in result && typeof result.error === "string"
            ? result.error
            : undefined) || "Sign in failed",
      };
    }

    // Better Auth returns { user, token }, not a full session
    // We need to get the session separately after successful sign in
    const sessionData = await getSession();

    return {
      success: true,
      session: sessionData.session || undefined,
      user: sessionData.user || undefined,
    };
  } catch (error) {
    console.error("[Auth Service] Error signing in:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

/**
 * Sign out the current user
 * Must be called from server actions
 */
export async function signOut(): Promise<boolean> {
  try {
    const headersList = await headers();
    await auth.api.signOut({
      headers: headersList,
    });
    return true;
  } catch (error) {
    console.error("[Auth Service] Error signing out:", error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession();
  return session !== null;
}

/**
 * Require authentication (throws if not authenticated)
 * Use in server actions/components that require auth
 */
export async function requireAuth(): Promise<SessionResult> {
  const result = await getSession();

  if (!result.session) {
    throw new Error("Authentication required");
  }

  return result;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  try {
    const headersList = await headers();
    await auth.api.forgetPassword({
      body: { email },
      headers: headersList,
    });
    return true;
  } catch (error) {
    console.error("[Auth Service] Error sending password reset:", error);
    return false;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const headersList = await headers();
    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
      headers: headersList,
    });
    return true;
  } catch (error) {
    console.error("[Auth Service] Error resetting password:", error);
    return false;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<boolean> {
  try {
    const headersList = await headers();
    const result = await auth.api.verifyEmail({
      query: { token },
      headers: headersList,
    });

    // Check if the result contains an error
    if (result && "error" in result) {
      console.error("[Auth Service] Email verification failed:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Auth Service] Error verifying email:", error);
    return false;
  }
}

/**
 * Update user password (when already authenticated)
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  try {
    await requireAuth();

    const headersList = await headers();
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: headersList,
    });
    return true;
  } catch (error) {
    console.error("[Auth Service] Error updating password:", error);
    return false;
  }
}

export const authService = {
  getSession,
  signUp,
  signIn,
  signOut,
  isAuthenticated,
  requireAuth,
  sendPasswordResetEmail,
  resetPassword,
  verifyEmail,
  updatePassword,
};
