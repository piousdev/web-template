import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Session } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  login: (user: User, session: Session) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export type AuthStore = AuthState & AuthActions;

/**
 * Zustand store for authentication state management
 *
 * Provides centralized authentication state with persistence to localStorage.
 * Automatically syncs across tabs/windows.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <>
 *           <p>Welcome {user?.name}</p>
 *           <button onClick={logout}>Logout</button>
 *         </>
 *       ) : (
 *         <p>Please log in</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session) => {
        set({ session });
      },

      login: (user, session) => {
        set({
          user,
          session,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          console.warn("[AuthStore] Cannot update user: No user is logged in");
          return;
        }

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and session, not isAuthenticated (will be derived)
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      // Restore isAuthenticated based on user presence
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.user;
        }
      },
    },
  ),
);

// Selectors for optimized component renders
export const selectUser = (state: AuthStore) => state.user;
export const selectSession = (state: AuthStore) => state.session;
export const selectIsAuthenticated = (state: AuthStore) =>
  state.isAuthenticated;
export const selectUserEmail = (state: AuthStore) => state.user?.email;
export const selectUserName = (state: AuthStore) => state.user?.name;
export const selectUserId = (state: AuthStore) => state.user?.id;
