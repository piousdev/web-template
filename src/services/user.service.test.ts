import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  countUsers,
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  updateUserImage,
  userExists,
  userExistsByEmail,
  verifyUserEmail,
} from "./user.service";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("User Service", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    offset: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    values: ReturnType<typeof vi.fn>;
    returning: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { db } = require("@/lib/db");
    mockDb = db;
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await getUserById("user-123");

      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await getUserById("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.limit.mockRejectedValue(new Error("Database error"));

      const result = await getUserById("user-123");

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.limit.mockRejectedValue(new Error("Database error"));

      const result = await getUserByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      mockDb.returning.mockResolvedValue([mockUser]);

      const result = await createUser({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it("should handle creation failure", async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await createUser({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create user");
    });

    it("should handle errors", async () => {
      mockDb.returning.mockRejectedValue(new Error("Constraint violation"));

      const result = await createUser({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Constraint violation");
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      mockDb.limit.mockResolvedValue([]); // No existing user with new email
      mockDb.returning.mockResolvedValue([
        { ...mockUser, name: "Updated Name" },
      ]);

      const result = await updateUser("user-123", { name: "Updated Name" });

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe("Updated Name");
    });

    it("should prevent email update if already taken", async () => {
      mockDb.limit.mockResolvedValue([{ ...mockUser, id: "other-user" }]); // Existing user

      const result = await updateUser("user-123", {
        email: "taken@example.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already in use");
    });

    it("should allow email update to same email", async () => {
      mockDb.limit.mockResolvedValue([mockUser]); // Same user
      mockDb.returning.mockResolvedValue([mockUser]);

      const result = await updateUser("user-123", {
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should handle user not found", async () => {
      mockDb.limit.mockResolvedValue([]);
      mockDb.returning.mockResolvedValue([]);

      const result = await updateUser("nonexistent", { name: "New Name" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should handle errors", async () => {
      mockDb.returning.mockRejectedValue(new Error("Update failed"));

      const result = await updateUser("user-123", { name: "New Name" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockDb.where.mockResolvedValue(undefined);

      const result = await deleteUser("user-123");

      expect(result).toBe(true);
    });

    it("should handle errors", async () => {
      mockDb.where.mockRejectedValue(new Error("Delete failed"));

      const result = await deleteUser("user-123");

      expect(result).toBe(false);
    });
  });

  describe("updateUserImage", () => {
    it("should update user image successfully", async () => {
      mockDb.limit.mockResolvedValue([]);
      mockDb.returning.mockResolvedValue([
        { ...mockUser, image: "https://example.com/image.jpg" },
      ]);

      const result = await updateUserImage(
        "user-123",
        "https://example.com/image.jpg",
      );

      expect(result.success).toBe(true);
      expect(result.user?.image).toBe("https://example.com/image.jpg");
    });
  });

  describe("verifyUserEmail", () => {
    it("should verify email successfully", async () => {
      mockDb.returning.mockResolvedValue([
        { ...mockUser, emailVerified: true },
      ]);

      const result = await verifyUserEmail("user-123");

      expect(result.success).toBe(true);
      expect(result.user?.emailVerified).toBe(true);
    });

    it("should handle user not found", async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await verifyUserEmail("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should handle errors", async () => {
      mockDb.returning.mockRejectedValue(new Error("Verification failed"));

      const result = await verifyUserEmail("user-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Verification failed");
    });
  });

  describe("userExists", () => {
    it("should return true when user exists", async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await userExists("user-123");

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await userExists("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("userExistsByEmail", () => {
    it("should return true when user exists", async () => {
      mockDb.limit.mockResolvedValue([mockUser]);

      const result = await userExistsByEmail("test@example.com");

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await userExistsByEmail("nonexistent@example.com");

      expect(result).toBe(false);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users with default pagination", async () => {
      const mockUsers = [mockUser, { ...mockUser, id: "user-456" }];
      mockDb.offset.mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it("should support custom pagination", async () => {
      const mockUsers = [mockUser];
      mockDb.offset.mockResolvedValue(mockUsers);

      const result = await getAllUsers(10, 5);

      expect(result).toEqual(mockUsers);
    });

    it("should handle errors", async () => {
      mockDb.offset.mockRejectedValue(new Error("Query failed"));

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("countUsers", () => {
    it("should return user count", async () => {
      const mockUsers = [mockUser, { ...mockUser, id: "user-456" }];
      mockDb.from.mockResolvedValue(mockUsers);

      const result = await countUsers();

      expect(result).toBe(2);
    });

    it("should handle errors", async () => {
      mockDb.from.mockRejectedValue(new Error("Count failed"));

      const result = await countUsers();

      expect(result).toBe(0);
    });
  });
});
