import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  isOnline: boolean;
  isLoading: boolean;
  globalError: string | null;
}

interface AppActions {
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
}

export type AppStore = AppState & AppActions;

/**
 * Zustand store for application-wide state management
 *
 * Manages UI state, notifications, theme, sidebar, and global loading/error states.
 * Persists theme and sidebar preferences to localStorage.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, addNotification, isLoading } = useAppStore();
 *
 *   const handleAction = () => {
 *     addNotification({
 *       type: 'success',
 *       title: 'Success',
 *       message: 'Action completed!',
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Theme: {theme}</p>
 *       <button onClick={handleAction}>Do Something</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      sidebarOpen: true,
      sidebarCollapsed: false,
      notifications: [],
      isOnline: true,
      isLoading: false,
      globalError: null,

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Notification actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();

        const newNotification: Notification = {
          id,
          timestamp,
          ...notification,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration (default 5 seconds)
        if (notification.duration !== 0) {
          const duration = notification.duration || 5000;
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Online status
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
      },

      // Loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Global error
      setGlobalError: (error) => {
        set({ globalError: error });
      },

      clearGlobalError: () => {
        set({ globalError: null });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist theme and sidebar preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

// Selectors for optimized component renders
export const selectTheme = (state: AppStore) => state.theme;
export const selectSidebarOpen = (state: AppStore) => state.sidebarOpen;
export const selectSidebarCollapsed = (state: AppStore) =>
  state.sidebarCollapsed;
export const selectNotifications = (state: AppStore) => state.notifications;
export const selectIsOnline = (state: AppStore) => state.isOnline;
export const selectIsLoading = (state: AppStore) => state.isLoading;
export const selectGlobalError = (state: AppStore) => state.globalError;
export const selectHasNotifications = (state: AppStore) =>
  state.notifications.length > 0;
export const selectNotificationCount = (state: AppStore) =>
  state.notifications.length;

/**
 * Hook to set up online/offline status listener
 * Call this in your root component
 */
export function useOnlineStatusListener() {
  const setOnlineStatus = useAppStore((state) => state.setOnlineStatus);

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => setOnlineStatus(true));
    window.addEventListener("offline", () => setOnlineStatus(false));
  }
}
