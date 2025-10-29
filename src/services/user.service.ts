import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewUser, type User, users } from "@/lib/db/schema";

export interface UpdateUserData {
  name?: string;
  email?: string;
  image?: string;
}

export interface UserResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user || null;
  } catch (error) {
    console.error("[User Service] Error fetching user by ID:", error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || null;
  } catch (error) {
    console.error("[User Service] Error fetching user by email:", error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: NewUser): Promise<UserResult> {
  try {
    const [user] = await db.insert(users).values(userData).returning();

    if (!user) {
      return {
        success: false,
        error: "Failed to create user",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[User Service] Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  data: UpdateUserData,
): Promise<UserResult> {
  try {
    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingUser = await getUserByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          error: "Email already in use",
        };
      }
    }

    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[User Service] Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[User Service] Error deleting user:", error);
    return false;
  }
}

/**
 * Update user profile image
 */
export async function updateUserImage(
  userId: string,
  imageUrl: string,
): Promise<UserResult> {
  return updateUser(userId, { image: imageUrl });
}

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string): Promise<UserResult> {
  try {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[User Service] Error verifying email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if user exists by email
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}

/**
 * Check if user exists by ID
 */
export async function userExists(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user !== null;
}

/**
 * Get all users (for admin purposes)
 * Returns paginated results
 */
export async function getAllUsers(limit = 50, offset = 0): Promise<User[]> {
  try {
    const allUsers = await db.select().from(users).limit(limit).offset(offset);
    return allUsers;
  } catch (error) {
    console.error("[User Service] Error fetching all users:", error);
    return [];
  }
}

/**
 * Count total users
 */
export async function countUsers(): Promise<number> {
  try {
    const result = await db.select().from(users);
    return result.length;
  } catch (error) {
    console.error("[User Service] Error counting users:", error);
    return 0;
  }
}

export const userService = {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  updateUserImage,
  verifyUserEmail,
  userExists,
  userExistsByEmail,
  getAllUsers,
  countUsers,
};
