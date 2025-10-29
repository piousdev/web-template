"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
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
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

interface UseAuthReturn extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Custom hook for Better Auth integration
 *
 * Provides authentication state and methods for sign in, sign up, and sign out.
 * Automatically fetches and manages user session on mount.
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => signIn({ email: '...', password: '...' })}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome {user?.name}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * Effect Event for updating auth state
   * This allows us to use the latest setState without causing Effect re-runs
   */
  const onSessionFetched = useEffectEvent(
    (data: { user?: User; session?: Session } | null) => {
      if (!data) {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      setState({
        user: data.user || null,
        session: data.session || null,
        isLoading: false,
        isAuthenticated: !!data.user,
      });
    },
  );

  /**
   * Fetch current session from Better Auth
   * Wrapped as Effect Event to avoid dependency issues in useEffect
   */
  const fetchSession = useEffectEvent(async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        onSessionFetched(null);
        return;
      }

      const data = await response.json();
      onSessionFetched(data);
    } catch (error) {
      console.error("[useAuth] Failed to fetch session:", error);
      onSessionFetched(null);
    }
  });

  /**
   * Sign in with email and password
   */
  const signIn = async (credentials: SignInCredentials): Promise<void> => {
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }

      // Refresh session after successful sign in
      await fetchSession();
      router.push("/dashboard");
    } catch (error) {
      console.error("[useAuth] Sign in failed:", error);
      throw error;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }

      // Refresh session after successful sign up
      await fetchSession();
      router.push("/dashboard");
    } catch (error) {
      console.error("[useAuth] Sign up failed:", error);
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Sign out failed");
      }

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });

      router.push("/login");
    } catch (error) {
      console.error("[useAuth] Sign out failed:", error);
      throw error;
    }
  };

  /**
   * Manually refresh session
   */
  const refreshSession = async (): Promise<void> => {
    await fetchSession();
  };

  // Fetch session on mount
  // fetchSession is an Effect Event, so it's not included in dependencies
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchSession is a React 19 useEffectEvent, which is intentionally excluded from dependencies
  useEffect(() => {
    fetchSession();
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
