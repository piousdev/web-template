/**
 * Zustand Stores
 *
 * Central export for all Zustand stores used throughout the application.
 */

export type { AppStore } from "./app.store";
// App Store
export {
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
  useOnlineStatusListener,
} from "./app.store";
export type { AuthStore } from "./auth.store";
// Auth Store
export {
  selectIsAuthenticated,
  selectSession,
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserName,
  useAuthStore,
} from "./auth.store";
