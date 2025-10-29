import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSession,
  isAuthenticated,
  requireAuth,
  resetPassword,
  sendPasswordResetEmail,
  signIn,
  signOut,
  signUp,
  updatePassword,
  verifyEmail,
} from "./auth.service";

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock auth lib
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
      forgetPassword: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      changePassword: vi.fn(),
    },
  },
}));

describe("Auth Service", () => {
  const mockSession = {
    user: {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
    },
    session: {
      token: "session-token",
      expiresAt: new Date(Date.now() + 86400000),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("should return session when authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result.session).toEqual(mockSession);
      expect(result.user).toEqual(mockSession.user);
    });

    it("should return null when not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockRejectedValue(new Error("Session error"));

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
    });
  });

  describe("signUp", () => {
    it("should sign up user successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signUpEmail.mockResolvedValue(mockSession);

      const result = await signUp({
        email: "new@example.com",
        password: "password123",
        name: "New User",
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockSession.user);
      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          email: "new@example.com",
          password: "password123",
          name: "New User",
        },
        headers: expect.anything(),
      });
    });

    it("should handle sign up errors", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signUpEmail.mockResolvedValue({ error: "Email already exists" });

      const result = await signUp({
        email: "existing@example.com",
        password: "password123",
        name: "User",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already exists");
    });

    it("should handle exceptions", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signUpEmail.mockRejectedValue(new Error("Network error"));

      const result = await signUp({
        email: "test@example.com",
        password: "password123",
        name: "User",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("signIn", () => {
    it("should sign in user successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signInEmail.mockResolvedValue(mockSession);

      const result = await signIn({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockSession.user);
      expect(auth.api.signInEmail).toHaveBeenCalledWith({
        body: {
          email: "test@example.com",
          password: "password123",
        },
        headers: expect.anything(),
      });
    });

    it("should handle invalid credentials", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signInEmail.mockResolvedValue({ error: "Invalid credentials" });

      const result = await signIn({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signOut.mockResolvedValue(undefined);

      const result = await signOut();

      expect(result).toBe(true);
      expect(auth.api.signOut).toHaveBeenCalled();
    });

    it("should handle sign out errors", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.signOut.mockRejectedValue(new Error("Sign out failed"));

      const result = await signOut();

      expect(result).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(mockSession);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false when user is not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("requireAuth", () => {
    it("should return session when authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result.session).toEqual(mockSession);
      expect(result.user).toEqual(mockSession.user);
    });

    it("should throw error when not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow("Authentication required");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.forgetPassword.mockResolvedValue(undefined);

      const result = await sendPasswordResetEmail("test@example.com");

      expect(result).toBe(true);
      expect(auth.api.forgetPassword).toHaveBeenCalledWith({
        body: { email: "test@example.com" },
        headers: expect.anything(),
      });
    });

    it("should handle errors", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.forgetPassword.mockRejectedValue(new Error("Failed"));

      const result = await sendPasswordResetEmail("test@example.com");

      expect(result).toBe(false);
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.resetPassword.mockResolvedValue(undefined);

      const result = await resetPassword("token-123", "newpassword123");

      expect(result).toBe(true);
      expect(auth.api.resetPassword).toHaveBeenCalledWith({
        body: {
          token: "token-123",
          password: "newpassword123",
        },
        headers: expect.anything(),
      });
    });

    it("should handle errors", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.resetPassword.mockRejectedValue(new Error("Invalid token"));

      const result = await resetPassword("invalid-token", "newpassword");

      expect(result).toBe(false);
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.verifyEmail.mockResolvedValue(undefined);

      const result = await verifyEmail("verify-token");

      expect(result).toBe(true);
      expect(auth.api.verifyEmail).toHaveBeenCalledWith({
        body: { token: "verify-token" },
        headers: expect.anything(),
      });
    });

    it("should handle errors", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.verifyEmail.mockRejectedValue(new Error("Invalid token"));

      const result = await verifyEmail("invalid-token");

      expect(result).toBe(false);
    });
  });

  describe("updatePassword", () => {
    it("should update password when authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(mockSession);
      auth.api.changePassword.mockResolvedValue(undefined);

      const result = await updatePassword("oldpassword", "newpassword");

      expect(result).toBe(true);
      expect(auth.api.changePassword).toHaveBeenCalledWith({
        body: {
          currentPassword: "oldpassword",
          newPassword: "newpassword",
        },
        headers: expect.anything(),
      });
    });

    it("should fail when not authenticated", async () => {
      const { auth } = require("@/lib/auth");
      auth.api.getSession.mockResolvedValue(null);

      const result = await updatePassword("oldpassword", "newpassword");

      expect(result).toBe(false);
    });
  });
});
