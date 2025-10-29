import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { authService } from "@/services/auth.service";
import {
  getSessionAction,
  resetPasswordAction,
  sendPasswordResetAction,
  signInAction,
  signOutAction,
  signUpAction,
  updatePasswordAction,
  verifyEmailAction,
} from "./auth.actions";

// Mock Next.js functions
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth service
vi.mock("@/services/auth.service", () => ({
  authService: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    updatePassword: vi.fn(),
    isAuthenticated: vi.fn(),
    getSession: vi.fn(),
  },
}));

describe("Auth Actions", () => {
  const mockSignUpData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  const mockSignInData = {
    email: "test@example.com",
    password: "password123",
  };

  const mockSession = {
    id: "session-1",
    userId: "user-1",
    expiresAt: new Date("2025-12-31"),
  };

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    image: null,
    emailVerified: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUpAction", () => {
    it("should redirect to dashboard on successful sign up", async () => {
      (authService.signUp as Mock).mockResolvedValue({
        success: true,
        session: mockSession,
        user: mockUser,
      });

      await expect(signUpAction(mockSignUpData)).rejects.toThrow(
        "NEXT_REDIRECT: /dashboard",
      );
      expect(authService.signUp).toHaveBeenCalledWith(mockSignUpData);
    });

    it("should return error on failed sign up", async () => {
      (authService.signUp as Mock).mockResolvedValue({
        success: false,
        error: "Email already exists",
      });

      const result = await signUpAction(mockSignUpData);

      expect(result).toEqual({
        success: false,
        error: "Email already exists",
      });
      expect(authService.signUp).toHaveBeenCalledWith(mockSignUpData);
    });

    it("should handle service errors", async () => {
      (authService.signUp as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await signUpAction(mockSignUpData);

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("signInAction", () => {
    it("should redirect to dashboard on successful sign in", async () => {
      (authService.signIn as Mock).mockResolvedValue({
        success: true,
        session: mockSession,
        user: mockUser,
      });

      await expect(signInAction(mockSignInData)).rejects.toThrow(
        "NEXT_REDIRECT: /dashboard",
      );
      expect(authService.signIn).toHaveBeenCalledWith(mockSignInData);
    });

    it("should return error on failed sign in", async () => {
      (authService.signIn as Mock).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const result = await signInAction(mockSignInData);

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      });
      expect(authService.signIn).toHaveBeenCalledWith(mockSignInData);
    });

    it("should handle service errors", async () => {
      (authService.signIn as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await signInAction(mockSignInData);

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("signOutAction", () => {
    it("should redirect to login on successful sign out", async () => {
      (authService.signOut as Mock).mockResolvedValue(true);

      await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT: /login");
      expect(authService.signOut).toHaveBeenCalled();
    });

    it("should return error on failed sign out", async () => {
      (authService.signOut as Mock).mockResolvedValue(false);

      const result = await signOutAction();

      expect(result).toEqual({
        success: false,
        error: "Sign out failed",
      });
      expect(authService.signOut).toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      (authService.signOut as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await signOutAction();

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("sendPasswordResetAction", () => {
    it("should send password reset email successfully", async () => {
      (authService.sendPasswordResetEmail as Mock).mockResolvedValue(true);

      const result = await sendPasswordResetAction("test@example.com");

      expect(result).toEqual({
        success: true,
        data: { message: "Password reset email sent" },
      });
      expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should return error on failure", async () => {
      (authService.sendPasswordResetEmail as Mock).mockResolvedValue(false);

      const result = await sendPasswordResetAction("test@example.com");

      expect(result).toEqual({
        success: false,
        error: "Failed to send password reset email",
      });
    });

    it("should handle service errors", async () => {
      (authService.sendPasswordResetEmail as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await sendPasswordResetAction("test@example.com");

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("resetPasswordAction", () => {
    it("should reset password successfully", async () => {
      (authService.resetPassword as Mock).mockResolvedValue(true);

      const result = await resetPasswordAction("token123", "newPassword123");

      expect(result).toEqual({
        success: true,
        data: { message: "Password reset successful" },
      });
      expect(authService.resetPassword).toHaveBeenCalledWith(
        "token123",
        "newPassword123",
      );
    });

    it("should return error on failure", async () => {
      (authService.resetPassword as Mock).mockResolvedValue(false);

      const result = await resetPasswordAction("token123", "newPassword123");

      expect(result).toEqual({
        success: false,
        error: "Failed to reset password",
      });
    });

    it("should handle service errors", async () => {
      (authService.resetPassword as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await resetPasswordAction("token123", "newPassword123");

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("verifyEmailAction", () => {
    it("should verify email successfully", async () => {
      (authService.verifyEmail as Mock).mockResolvedValue(true);

      const result = await verifyEmailAction("token123");

      expect(result).toEqual({
        success: true,
        data: { message: "Email verified successfully" },
      });
      expect(authService.verifyEmail).toHaveBeenCalledWith("token123");
    });

    it("should return error on failure", async () => {
      (authService.verifyEmail as Mock).mockResolvedValue(false);

      const result = await verifyEmailAction("token123");

      expect(result).toEqual({
        success: false,
        error: "Failed to verify email",
      });
    });

    it("should handle service errors", async () => {
      (authService.verifyEmail as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await verifyEmailAction("token123");

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("updatePasswordAction", () => {
    it("should update password successfully when authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (authService.updatePassword as Mock).mockResolvedValue(true);

      const result = await updatePasswordAction("currentPass", "newPass");

      expect(result).toEqual({
        success: true,
        data: { message: "Password updated successfully" },
      });
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.updatePassword).toHaveBeenCalledWith(
        "currentPass",
        "newPass",
      );
    });

    it("should return error when not authenticated", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(false);

      const result = await updatePasswordAction("currentPass", "newPass");

      expect(result).toEqual({
        success: false,
        error: "Authentication required",
      });
      expect(authService.updatePassword).not.toHaveBeenCalled();
    });

    it("should return error on update failure", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (authService.updatePassword as Mock).mockResolvedValue(false);

      const result = await updatePasswordAction("currentPass", "newPass");

      expect(result).toEqual({
        success: false,
        error: "Failed to update password",
      });
    });

    it("should handle service errors", async () => {
      (authService.isAuthenticated as Mock).mockResolvedValue(true);
      (authService.updatePassword as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await updatePasswordAction("currentPass", "newPass");

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("getSessionAction", () => {
    it("should get session successfully", async () => {
      (authService.getSession as Mock).mockResolvedValue({
        session: mockSession,
        user: mockUser,
      });

      const result = await getSessionAction();

      expect(result).toEqual({
        success: true,
        data: {
          session: mockSession,
          user: mockUser,
          isAuthenticated: true,
        },
      });
      expect(authService.getSession).toHaveBeenCalled();
    });

    it("should return null session when not authenticated", async () => {
      (authService.getSession as Mock).mockResolvedValue({
        session: null,
        user: null,
      });

      const result = await getSessionAction();

      expect(result).toEqual({
        success: true,
        data: {
          session: null,
          user: null,
          isAuthenticated: false,
        },
      });
    });

    it("should handle service errors", async () => {
      (authService.getSession as Mock).mockRejectedValue(
        new Error("Service error"),
      );

      const result = await getSessionAction();

      expect(result).toEqual({
        success: false,
        error: "Service error",
      });
    });
  });
});
