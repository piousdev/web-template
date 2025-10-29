import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  selectGlobalError,
  selectHasNotifications,
  selectIsLoading,
  selectIsOnline,
  selectNotificationCount,
  selectNotifications,
  selectSidebarCollapsed,
  selectSidebarOpen,
  selectTheme,
  useAppStore,
} from "./app.store";

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

describe("useAppStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
    // Reset store state
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setTheme("system");
      result.current.setSidebarOpen(true);
      result.current.setSidebarCollapsed(false);
      result.current.clearNotifications();
      result.current.setLoading(false);
      result.current.clearGlobalError();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.theme).toBe("system");
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.sidebarCollapsed).toBe(false);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.globalError).toBeNull();
    });
  });

  describe("Theme", () => {
    it("should set theme", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should toggle between themes", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTheme("light");
      });
      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.setTheme("dark");
      });
      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.setTheme("system");
      });
      expect(result.current.theme).toBe("system");
    });
  });

  describe("Sidebar", () => {
    it("should toggle sidebar open/closed", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.sidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(true);
    });

    it("should set sidebar open state", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSidebarOpen(false);
      });

      expect(result.current.sidebarOpen).toBe(false);

      act(() => {
        result.current.setSidebarOpen(true);
      });

      expect(result.current.sidebarOpen).toBe(true);
    });

    it("should toggle sidebar collapsed state", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.sidebarCollapsed).toBe(false);

      act(() => {
        result.current.toggleSidebarCollapsed();
      });

      expect(result.current.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebarCollapsed();
      });

      expect(result.current.sidebarCollapsed).toBe(false);
    });

    it("should set sidebar collapsed state", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSidebarCollapsed(true);
      });

      expect(result.current.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.setSidebarCollapsed(false);
      });

      expect(result.current.sidebarCollapsed).toBe(false);
    });
  });

  describe("Notifications", () => {
    it("should add notification", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "Success",
          message: "Operation completed",
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe("success");
      expect(result.current.notifications[0].title).toBe("Success");
      expect(result.current.notifications[0].message).toBe(
        "Operation completed",
      );
      expect(result.current.notifications[0].id).toBeTruthy();
      expect(result.current.notifications[0].timestamp).toBeTruthy();
    });

    it("should add multiple notifications", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "Success 1",
          message: "Message 1",
        });

        result.current.addNotification({
          type: "error",
          title: "Error 1",
          message: "Message 2",
        });
      });

      expect(result.current.notifications).toHaveLength(2);
    });

    it("should auto-remove notification after default duration", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "info",
          title: "Info",
          message: "This will auto-dismiss",
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      // Fast-forward time by 5 seconds (default duration)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it("should auto-remove notification after custom duration", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "warning",
          title: "Warning",
          message: "Custom duration",
          duration: 3000,
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      // Fast-forward time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it("should not auto-remove notification with duration 0", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "error",
          title: "Persistent",
          message: "This stays until manually removed",
          duration: 0,
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      // Fast-forward time by 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should still be there
      expect(result.current.notifications).toHaveLength(1);
    });

    it("should remove specific notification", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "Notification 1",
          message: "Message 1",
        });

        result.current.addNotification({
          type: "info",
          title: "Notification 2",
          message: "Message 2",
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      const firstNotificationId = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(firstNotificationId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe("Notification 2");
    });

    it("should clear all notifications", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "N1",
          message: "M1",
        });

        result.current.addNotification({
          type: "info",
          title: "N2",
          message: "M2",
        });

        result.current.addNotification({
          type: "warning",
          title: "N3",
          message: "M3",
        });
      });

      expect(result.current.notifications).toHaveLength(3);

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe("Online Status", () => {
    it("should set online status", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.isOnline).toBe(true);

      act(() => {
        result.current.setOnlineStatus(false);
      });

      expect(result.current.isOnline).toBe(false);

      act(() => {
        result.current.setOnlineStatus(true);
      });

      expect(result.current.isOnline).toBe(true);
    });
  });

  describe("Loading State", () => {
    it("should set loading state", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Global Error", () => {
    it("should set global error", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.globalError).toBeNull();

      act(() => {
        result.current.setGlobalError("Something went wrong");
      });

      expect(result.current.globalError).toBe("Something went wrong");
    });

    it("should clear global error", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setGlobalError("Error occurred");
      });

      expect(result.current.globalError).toBe("Error occurred");

      act(() => {
        result.current.clearGlobalError();
      });

      expect(result.current.globalError).toBeNull();
    });
  });

  describe("Selectors", () => {
    it("should select theme", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTheme("dark");
      });

      const theme = selectTheme(result.current);
      expect(theme).toBe("dark");
    });

    it("should select sidebar states", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSidebarOpen(false);
        result.current.setSidebarCollapsed(true);
      });

      expect(selectSidebarOpen(result.current)).toBe(false);
      expect(selectSidebarCollapsed(result.current)).toBe(true);
    });

    it("should select notifications", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "Test",
          message: "Message",
        });
      });

      const notifications = selectNotifications(result.current);
      expect(notifications).toHaveLength(1);
    });

    it("should select has notifications", () => {
      const { result } = renderHook(() => useAppStore());

      expect(selectHasNotifications(result.current)).toBe(false);

      act(() => {
        result.current.addNotification({
          type: "info",
          title: "Test",
          message: "Message",
        });
      });

      expect(selectHasNotifications(result.current)).toBe(true);
    });

    it("should select notification count", () => {
      const { result } = renderHook(() => useAppStore());

      expect(selectNotificationCount(result.current)).toBe(0);

      act(() => {
        result.current.addNotification({
          type: "success",
          title: "N1",
          message: "M1",
        });

        result.current.addNotification({
          type: "error",
          title: "N2",
          message: "M2",
        });
      });

      expect(selectNotificationCount(result.current)).toBe(2);
    });

    it("should select online status", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setOnlineStatus(false);
      });

      expect(selectIsOnline(result.current)).toBe(false);
    });

    it("should select loading state", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(selectIsLoading(result.current)).toBe(true);
    });

    it("should select global error", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setGlobalError("Test error");
      });

      expect(selectGlobalError(result.current)).toBe("Test error");
    });
  });

  describe("Persistence", () => {
    it("should persist theme to localStorage", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTheme("dark");
      });

      const stored = localStorageMock.getItem("app-storage");
      expect(stored).toBeTruthy();
      if (!stored) return;

      const parsed = JSON.parse(stored);
      expect(parsed.state.theme).toBe("dark");
    });

    it("should persist sidebar states to localStorage", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSidebarOpen(false);
        result.current.setSidebarCollapsed(true);
      });

      const stored = localStorageMock.getItem("app-storage");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      expect(parsed.state.sidebarOpen).toBe(false);
      expect(parsed.state.sidebarCollapsed).toBe(true);
    });

    it("should not persist notifications", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: "info",
          title: "Test",
          message: "Should not persist",
        });
      });

      const stored = localStorageMock.getItem("app-storage");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      expect(parsed.state.notifications).toBeUndefined();
    });

    it("should restore persisted state", () => {
      const { result: firstResult } = renderHook(() => useAppStore());

      act(() => {
        firstResult.current.setTheme("light");
        firstResult.current.setSidebarOpen(false);
        firstResult.current.setSidebarCollapsed(true);
      });

      // Simulate new hook instance
      const { result: secondResult } = renderHook(() => useAppStore());

      expect(secondResult.current.theme).toBe("light");
      expect(secondResult.current.sidebarOpen).toBe(false);
      expect(secondResult.current.sidebarCollapsed).toBe(true);
    });
  });
});
