import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useAuth } from "./use-auth";

// Mock React's useEffectEvent
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useEffectEvent: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockClear();
  });

  describe("Initial State", () => {
    it("should start with loading state", () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it("should fetch session on mount", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        emailVerified: true,
      };

      const mockSession = {
        id: "session-1",
        userId: "1",
        expiresAt: new Date(),
      };

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          session: mockSession,
        }),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });
    });

    it("should handle session fetch failure", async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it("should handle network errors during session fetch", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (global.fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("signIn", () => {
    it("should sign in successfully", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        emailVerified: true,
      };

      // Mock initial session fetch (no user)
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock sign in request
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock session fetch after sign in
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          session: { id: "session-1", userId: "1" },
        }),
      });

      await result.current.signIn({
        email: "test@example.com",
        password: "password123",
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should handle sign in failure", async () => {
      // Mock initial session fetch
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed sign in
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials" }),
      });

      await expect(
        result.current.signIn({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid credentials");

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should sign up successfully", async () => {
      const mockUser = {
        id: "1",
        email: "newuser@example.com",
        name: "New User",
        image: null,
        emailVerified: false,
      };

      // Mock initial session fetch
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock sign up request
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock session fetch after sign up
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          session: { id: "session-1", userId: "1" },
        }),
      });

      await result.current.signUp({
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should handle sign up failure", async () => {
      // Mock initial session fetch
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed sign up
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Email already exists" }),
      });

      await expect(
        result.current.signUp({
          name: "Test User",
          email: "existing@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Email already exists");

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        emailVerified: true,
      };

      // Mock initial session fetch (authenticated)
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          session: { id: "session-1", userId: "1" },
        }),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock sign out request
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await result.current.signOut();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("should handle sign out failure", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock initial session fetch (authenticated)
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: "1", email: "test@example.com" },
          session: { id: "session-1" },
        }),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock failed sign out
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(result.current.signOut()).rejects.toThrow("Sign out failed");

      // User state should remain unchanged on failure
      expect(result.current.isAuthenticated).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("refreshSession", () => {
    it("should refresh session successfully", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        emailVerified: true,
      };

      // Mock initial session fetch
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          session: { id: "session-1", userId: "1" },
        }),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock refreshed session
      const updatedUser = { ...mockUser, name: "Updated Name" };
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: updatedUser,
          session: { id: "session-1", userId: "1" },
        }),
      });

      await result.current.refreshSession();

      await waitFor(() => {
        expect(result.current.user?.name).toBe("Updated Name");
      });
    });
  });
});
