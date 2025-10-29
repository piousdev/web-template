import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
  checkUserExistsAction,
  countUsersAction,
  deleteCurrentUserAction,
  deleteUserByIdAction,
  getAllUsersAction,
  getCurrentUserAction,
  getUserByIdAction,
  updateCurrentUserAction,
  updateUserByIdAction,
  updateUserImageAction,
} from "./user.actions";

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth service
vi.mock("@/services/auth.service", () => ({
  authService: {
    requireAuth: vi.fn(),
    isAuthenticated: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock user service
vi.mock("@/services/user.service", () => ({
  userService: {
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    updateUserImage: vi.fn(),
    userExistsByEmail: vi.fn(),
    getAllUsers: vi.fn(),
    countUsers: vi.fn(),
  },
}));

describe("User Actions", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    image: null,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: "session-1",
    userId: "user-1",
    expiresAt: new Date("2025-12-31"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUserAction", () => {
    it("should get current user successfully", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.getUserById as Mock).mockResolvedValue(mockUser);

      const result = await getCurrentUserAction();

      expect(result).toEqual({
        success: true,
        data: mockUser,
      });
      expect(authService.requireAuth).toHaveBeenCalled();
      expect(userService.getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return error when user not found", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.getUserById as Mock).mockResolvedValue(null);

      const result = await getCurrentUserAction();

      expect(result).toEqual({
        success: false,
        error: "User not found in database",
      });
    });

    it("should handle auth errors", async () => {
      (authService.requireAuth as Mock).mockRejectedValue(
        new Error("Authentication required"),
      );

      const result = await getCurrentUserAction();

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
    });
  });

  describe("getUserByIdAction", () => {
    it("should get user by ID successfully", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.getUserById as Mock).mockResolvedValue(mockUser);

      const result = await getUserByIdAction("user-1");

      expect(result).toEqual({
        success: true,
        data: mockUser,
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(userService.getUserById).toHaveBeenCalledWith("user-1");
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await getUserByIdAction("user-1");

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it("should return error when user not found", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.getUserById as Mock).mockResolvedValue(null);

      const result = await getUserByIdAction("user-1");

      expect(result).toEqual({
        success: false,
        error: "User not found",
      });
    });
  });

  describe("updateCurrentUserAction", () => {
    const updateData = { name: "Updated Name" };

    it("should update current user successfully", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.updateUser as Mock).mockResolvedValue({
        success: true,
        user: updatedUser,
      });

      const result = await updateCurrentUserAction(updateData);

      expect(result).toEqual({
        success: true,
        data: updatedUser,
      });
      expect(authService.requireAuth).toHaveBeenCalled();
      expect(userService.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        updateData,
      );
    });

    it("should return error on update failure", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.updateUser as Mock).mockResolvedValue({
        success: false,
        error: "Email already in use",
      });

      const result = await updateCurrentUserAction(updateData);

      expect(result).toEqual({
        success: false,
        error: "Email already in use",
      });
    });

    it("should handle auth errors", async () => {
      (authService.requireAuth as Mock).mockRejectedValue(
        new Error("Authentication required"),
      );

      const result = await updateCurrentUserAction(updateData);

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
    });
  });

  describe("updateUserByIdAction", () => {
    const updateData = { name: "Updated Name" };

    it("should update user by ID successfully", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.updateUser as Mock).mockResolvedValue({
        success: true,
        user: updatedUser,
      });

      const result = await updateUserByIdAction("user-1", updateData);

      expect(result).toEqual({
        success: true,
        data: updatedUser,
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(userService.updateUser).toHaveBeenCalledWith("user-1", updateData);
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await updateUserByIdAction("user-1", updateData);

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(userService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe("deleteCurrentUserAction", () => {
    it("should delete current user successfully", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.deleteUser as Mock).mockResolvedValue(true);
      (authService.signOut as Mock).mockResolvedValue(true);

      const result = await deleteCurrentUserAction();

      expect(result).toEqual({
        success: true,
        data: { message: "User deleted successfully" },
      });
      expect(authService.requireAuth).toHaveBeenCalled();
      expect(userService.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(authService.signOut).toHaveBeenCalled();
    });

    it("should return error on delete failure", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.deleteUser as Mock).mockResolvedValue(false);

      const result = await deleteCurrentUserAction();

      expect(result).toEqual({
        success: false,
        error: "Failed to delete user",
      });
    });

    it("should handle auth errors", async () => {
      (authService.requireAuth as Mock).mockRejectedValue(
        new Error("Authentication required"),
      );

      const result = await deleteCurrentUserAction();

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
    });
  });

  describe("deleteUserByIdAction", () => {
    it("should delete user by ID successfully", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.deleteUser as Mock).mockResolvedValue(true);

      const result = await deleteUserByIdAction("user-1");

      expect(result).toEqual({
        success: true,
        data: { message: "User deleted successfully" },
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(userService.deleteUser).toHaveBeenCalledWith("user-1");
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await deleteUserByIdAction("user-1");

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });

    it("should return error on delete failure", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.deleteUser as Mock).mockResolvedValue(false);

      const result = await deleteUserByIdAction("user-1");

      expect(result).toEqual({
        success: false,
        error: "Failed to delete user",
      });
    });
  });

  describe("updateUserImageAction", () => {
    const imageUrl = "https://example.com/image.jpg";

    it("should update user image successfully", async () => {
      const updatedUser = { ...mockUser, image: imageUrl };
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.updateUserImage as Mock).mockResolvedValue({
        success: true,
        user: updatedUser,
      });

      const result = await updateUserImageAction(imageUrl);

      expect(result).toEqual({
        success: true,
        data: updatedUser,
      });
      expect(authService.requireAuth).toHaveBeenCalled();
      expect(userService.updateUserImage).toHaveBeenCalledWith(
        mockUser.id,
        imageUrl,
      );
    });

    it("should return error on update failure", async () => {
      (authService.requireAuth as Mock).mockResolvedValue({
        user: { id: mockUser.id },
        session: mockSession,
      });
      (userService.updateUserImage as Mock).mockResolvedValue({
        success: false,
        error: "Failed to update image",
      });

      const result = await updateUserImageAction(imageUrl);

      expect(result).toEqual({
        success: false,
        error: "Failed to update image",
      });
    });
  });

  describe("checkUserExistsAction", () => {
    it("should check if user exists successfully", async () => {
      (userService.userExistsByEmail as Mock).mockResolvedValue(true);

      const result = await checkUserExistsAction("test@example.com");

      expect(result).toEqual({
        success: true,
        data: true,
      });
      expect(userService.userExistsByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should return false when user does not exist", async () => {
      (userService.userExistsByEmail as Mock).mockResolvedValue(false);

      const result = await checkUserExistsAction("nonexistent@example.com");

      expect(result).toEqual({
        success: true,
        data: false,
      });
    });

    it("should handle service errors", async () => {
      (userService.userExistsByEmail as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await checkUserExistsAction("test@example.com");

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("getAllUsersAction", () => {
    const mockUsers = [
      mockUser,
      { ...mockUser, id: "user-2", email: "user2@example.com" },
    ];

    it("should get all users successfully", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.getAllUsers as Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsersAction(50, 0);

      expect(result).toEqual({
        success: true,
        data: mockUsers,
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(userService.getAllUsers).toHaveBeenCalledWith(50, 0);
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await getAllUsersAction();

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(userService.getAllUsers).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.getAllUsers as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await getAllUsersAction();

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("countUsersAction", () => {
    it("should count users successfully", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.countUsers as Mock).mockResolvedValue(42);

      const result = await countUsersAction();

      expect(result).toEqual({
        success: true,
        data: 42,
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(userService.countUsers).toHaveBeenCalled();
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await countUsersAction();

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(userService.countUsers).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (userService.countUsers as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await countUsersAction();

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });
});
