"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SignInData, SignUpData } from "@/services/auth.service";
import { authService } from "@/services/auth.service";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action for user sign up
 * Automatically redirects to dashboard on success
 */
export async function signUpAction(data: SignUpData): Promise<ActionResult> {
  try {
    const result = await authService.signUp(data);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Sign up failed",
      };
    }

    // Revalidate all routes to update auth state
    revalidatePath("/", "layout");

    // Redirect to dashboard on success
    redirect("/dashboard");
  } catch (error) {
    console.error("[Auth Actions] Sign up error:", error);

    // If this is a redirect, rethrow it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

/**
 * Server action for user sign in
 * Automatically redirects to dashboard on success
 */
export async function signInAction(data: SignInData): Promise<ActionResult> {
  try {
    const result = await authService.signIn(data);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Sign in failed",
      };
    }

    // Revalidate all routes to update auth state
    revalidatePath("/", "layout");

    // Redirect to dashboard on success
    redirect("/dashboard");
  } catch (error) {
    console.error("[Auth Actions] Sign in error:", error);

    // If this is a redirect, rethrow it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

/**
 * Server action for user sign out
 * Automatically redirects to login page on success
 */
export async function signOutAction(): Promise<ActionResult> {
  try {
    const success = await authService.signOut();

    if (!success) {
      return {
        success: false,
        error: "Sign out failed",
      };
    }

    // Revalidate all routes to clear auth state
    revalidatePath("/", "layout");

    // Redirect to login page
    redirect("/login");
  } catch (error) {
    console.error("[Auth Actions] Sign out error:", error);

    // If this is a redirect, rethrow it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
}

/**
 * Server action to send password reset email
 */
export async function sendPasswordResetAction(
  email: string,
): Promise<ActionResult> {
  try {
    const success = await authService.sendPasswordResetEmail(email);

    if (!success) {
      return {
        success: false,
        error: "Failed to send password reset email",
      };
    }

    return {
      success: true,
      data: { message: "Password reset email sent" },
    };
  } catch (error) {
    console.error("[Auth Actions] Password reset error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send reset email",
    };
  }
}

/**
 * Server action to reset password with token
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string,
): Promise<ActionResult> {
  try {
    const success = await authService.resetPassword(token, newPassword);

    if (!success) {
      return {
        success: false,
        error: "Failed to reset password",
      };
    }

    return {
      success: true,
      data: { message: "Password reset successful" },
    };
  } catch (error) {
    console.error("[Auth Actions] Reset password error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Server action to verify email with token
 */
export async function verifyEmailAction(token: string): Promise<ActionResult> {
  try {
    const success = await authService.verifyEmail(token);

    if (!success) {
      return {
        success: false,
        error: "Failed to verify email",
      };
    }

    // Revalidate to update email verified status
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { message: "Email verified successfully" },
    };
  } catch (error) {
    console.error("[Auth Actions] Verify email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}

/**
 * Server action to update user password (when authenticated)
 */
export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  try {
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const success = await authService.updatePassword(
      currentPassword,
      newPassword,
    );

    if (!success) {
      return {
        success: false,
        error: "Failed to update password",
      };
    }

    return {
      success: true,
      data: { message: "Password updated successfully" },
    };
  } catch (error) {
    console.error("[Auth Actions] Update password error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

/**
 * Server action to get current session
 * Returns session data without redirecting
 */
export async function getSessionAction(): Promise<ActionResult> {
  try {
    const result = await authService.getSession();

    return {
      success: true,
      data: {
        session: result.session,
        user: result.user,
        isAuthenticated: result.session !== null,
      },
    };
  } catch (error) {
    console.error("[Auth Actions] Get session error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get session",
    };
  }
}
