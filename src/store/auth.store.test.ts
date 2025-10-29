import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@/lib/auth";
import {
  selectIsAuthenticated,
  selectSession,
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserName,
  useAuthStore,
} from "./auth.store";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useAuthStore", () => {
  const mockUser = {
    id: "1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    email: "test@example.com",
    emailVerified: true,
    name: "Test User",
    image: null,
  };

  const mockSession: Session = {
    session: {
      id: "session-1",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      userId: "1",
      expiresAt: new Date("2025-12-31"),
      token: "mock-token",
    },
    user: mockUser,
  };

  beforeEach(() => {
    localStorageMock.clear();
    // Reset store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe("Initial State", () => {
    it("should have initial unauthenticated state", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should set user and update authentication state", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should clear user and update authentication state", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("setSession", () => {
    it("should set session", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);
    });

    it("should clear session", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);

      act(() => {
        result.current.setSession(null);
      });

      expect(result.current.session).toBeNull();
    });
  });

  describe("login", () => {
    it("should set user and session on login", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("logout", () => {
    it("should clear user and session on logout", () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      act(() => {
        result.current.login(mockUser, mockSession);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("updateUser", () => {
    it("should update user fields", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      act(() => {
        result.current.updateUser({
          name: "Updated Name",
          emailVerified: false,
        });
      });

      expect(result.current.user).toEqual({
        ...mockUser,
        name: "Updated Name",
        emailVerified: false,
      });
    });

    it("should not update if no user is logged in", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();

      act(() => {
        result.current.updateUser({ name: "New Name" });
      });

      expect(result.current.user).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[AuthStore] Cannot update user: No user is logged in",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should preserve unchanged fields", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      act(() => {
        result.current.updateUser({ name: "New Name" });
      });

      expect(result.current.user?.email).toBe(mockUser.email);
      expect(result.current.user?.id).toBe(mockUser.id);
      expect(result.current.user?.name).toBe("New Name");
    });
  });

  describe("Selectors", () => {
    it("should select user", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const user = selectUser(result.current);
      expect(user).toEqual(mockUser);
    });

    it("should select session", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const session = selectSession(result.current);
      expect(session).toEqual(mockSession);
    });

    it("should select isAuthenticated", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const isAuthenticated = selectIsAuthenticated(result.current);
      expect(isAuthenticated).toBe(true);
    });

    it("should select user email", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const email = selectUserEmail(result.current);
      expect(email).toBe(mockUser.email);
    });

    it("should select user name", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const name = selectUserName(result.current);
      expect(name).toBe(mockUser.name);
    });

    it("should select user id", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const id = selectUserId(result.current);
      expect(id).toBe(mockUser.id);
    });

    it("should return null for selectors when no user", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(selectUser(result.current)).toBeNull();
      expect(selectUserEmail(result.current)).toBeUndefined();
      expect(selectUserName(result.current)).toBeUndefined();
      expect(selectUserId(result.current)).toBeUndefined();
    });
  });

  describe("Persistence", () => {
    it("should persist user and session to localStorage", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const stored = localStorageMock.getItem("auth-storage");
      expect(stored).toBeTruthy();
      if (!stored) return;

      const parsed = JSON.parse(stored);
      expect(parsed.state.user).toEqual(mockUser);
      expect(parsed.state.session).toBeTruthy();
    });

    it("should restore state from localStorage", () => {
      // First, set up persisted state
      const { result: firstResult } = renderHook(() => useAuthStore());

      act(() => {
        firstResult.current.login(mockUser, mockSession);
      });

      // Simulate a new hook instance (e.g., page refresh)
      const { result: secondResult } = renderHook(() => useAuthStore());

      // The new instance should have the persisted state
      expect(secondResult.current.user).toEqual(mockUser);
      expect(secondResult.current.isAuthenticated).toBe(true);
    });

    it("should restore isAuthenticated based on user presence", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      // Simulate rehydration by creating a new instance
      const { result: rehydratedResult } = renderHook(() => useAuthStore());

      expect(rehydratedResult.current.isAuthenticated).toBe(true);
    });

    it("should clear localStorage on logout", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockUser, mockSession);
      });

      const storedBefore = localStorageMock.getItem("auth-storage");
      expect(storedBefore).toBeTruthy();

      act(() => {
        result.current.logout();
      });

      const storedAfter = localStorageMock.getItem("auth-storage");
      if (!storedAfter) return;
      const parsed = JSON.parse(storedAfter);
      expect(parsed.state.user).toBeNull();
      expect(parsed.state.session).toBeNull();
    });
  });
});
