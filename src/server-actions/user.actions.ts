"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@/lib/db/schema";
import { authService } from "@/services/auth.service";
import { type UpdateUserData, userService } from "@/services/user.service";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to get current user profile
 * Requires authentication
 */
export async function getCurrentUserAction(): Promise<ActionResult<User>> {
  try {
    const { user } = await authService.requireAuth();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Fetch full user data from database
    const fullUser = await userService.getUserById(user.id);

    if (!fullUser) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    return {
      success: true,
      data: fullUser,
    };
  } catch (error) {
    console.error("[User Actions] Get current user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Server action to get user by ID
 * Requires authentication
 */
export async function getUserByIdAction(
  userId: string,
): Promise<ActionResult<User>> {
  try {
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[User Actions] Get user by ID error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Server action to update current user profile
 * Requires authentication
 */
export async function updateCurrentUserAction(
  data: UpdateUserData,
): Promise<ActionResult<User>> {
  try {
    const { user } = await authService.requireAuth();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const result = await userService.updateUser(user.id, data);

    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error || "Failed to update user",
      };
    }

    // Revalidate all routes to update user data
    revalidatePath("/", "layout");

    return {
      success: true,
      data: result.user,
    };
  } catch (error) {
    console.error("[User Actions] Update current user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Server action to update user by ID
 * Requires authentication (typically admin only)
 */
export async function updateUserByIdAction(
  userId: string,
  data: UpdateUserData,
): Promise<ActionResult<User>> {
  try {
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const result = await userService.updateUser(userId, data);

    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error || "Failed to update user",
      };
    }

    // Revalidate to update user data
    revalidatePath("/", "layout");

    return {
      success: true,
      data: result.user,
    };
  } catch (error) {
    console.error("[User Actions] Update user by ID error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Server action to delete current user account
 * Requires authentication
 */
export async function deleteCurrentUserAction(): Promise<ActionResult> {
  try {
    const { user } = await authService.requireAuth();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const success = await userService.deleteUser(user.id);

    if (!success) {
      return {
        success: false,
        error: "Failed to delete user",
      };
    }

    // Sign out the user
    await authService.signOut();

    // Revalidate all routes
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { message: "User deleted successfully" },
    };
  } catch (error) {
    console.error("[User Actions] Delete current user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Server action to delete user by ID
 * Requires authentication (typically admin only)
 */
export async function deleteUserByIdAction(
  userId: string,
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

    const success = await userService.deleteUser(userId);

    if (!success) {
      return {
        success: false,
        error: "Failed to delete user",
      };
    }

    // Revalidate to update user lists
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { message: "User deleted successfully" },
    };
  } catch (error) {
    console.error("[User Actions] Delete user by ID error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Server action to update user profile image
 * Requires authentication
 */
export async function updateUserImageAction(
  imageUrl: string,
): Promise<ActionResult<User>> {
  try {
    const { user } = await authService.requireAuth();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const result = await userService.updateUserImage(user.id, imageUrl);

    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error || "Failed to update image",
      };
    }

    // Revalidate to update image
    revalidatePath("/", "layout");

    return {
      success: true,
      data: result.user,
    };
  } catch (error) {
    console.error("[User Actions] Update user image error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update image",
    };
  }
}

/**
 * Server action to check if user exists by email
 * Public action (no auth required)
 */
export async function checkUserExistsAction(
  email: string,
): Promise<ActionResult<boolean>> {
  try {
    const exists = await userService.userExistsByEmail(email);

    return {
      success: true,
      data: exists,
    };
  } catch (error) {
    console.error("[User Actions] Check user exists error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check user",
    };
  }
}

/**
 * Server action to get all users (paginated)
 * Requires authentication (typically admin only)
 */
export async function getAllUsersAction(
  limit = 50,
  offset = 0,
): Promise<ActionResult<User[]>> {
  try {
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const users = await userService.getAllUsers(limit, offset);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("[User Actions] Get all users error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get users",
    };
  }
}

/**
 * Server action to count total users
 * Requires authentication (typically admin only)
 */
export async function countUsersAction(): Promise<ActionResult<number>> {
  try {
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const count = await userService.countUsers();

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("[User Actions] Count users error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to count users",
    };
  }
}
