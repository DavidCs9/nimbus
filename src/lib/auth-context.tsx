"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "@/lib/auth-service";

/**
 * User interface representing the authenticated user's profile
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  // Add other user attributes as needed
}

/**
 * Authentication tokens from Cognito
 */
export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Authentication state that will be shared across the application
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication context actions
 */
export interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
}

/**
 * Default authentication state
 */
const defaultAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing session
  error: null,
};

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to use the authentication context
 * Throws an error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Authentication provider component props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Storage keys for session persistence
 */
const STORAGE_KEYS = {
  TOKENS: "nimbus_auth_tokens",
  USER: "nimbus_auth_user",
} as const;

/**
 * Authentication provider component
 * Manages authentication state and provides auth methods to child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  /**
   * Load authentication state from session storage on mount
   */
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedTokens = sessionStorage.getItem(STORAGE_KEYS.TOKENS);
        const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);

        if (storedTokens && storedUser) {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          const user: User = JSON.parse(storedUser);

          // Check if tokens are still valid
          if (tokens.expiresAt > Date.now()) {
            setAuthState({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          } else {
            // Clear expired tokens
            clearStoredAuth();
          }
        }
      } catch (error) {
        console.error("Error loading stored authentication:", error);
        clearStoredAuth();
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    loadStoredAuth();
  }, []);

  /**
   * Clear stored authentication data from session storage
   */
  const clearStoredAuth = () => {
    sessionStorage.removeItem(STORAGE_KEYS.TOKENS);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  };

  /**
   * Store authentication data in session storage
   */
  const storeAuth = (user: User, tokens: AuthTokens) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing authentication data:", error);
    }
  };

  /**
   * Sign in - redirects to Cognito Hosted UI
   */
  const signIn = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use the auth service class instance
      await authService.initiateSignIn();
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }));
    }
  };

  /**
   * Sign out - clears local state and redirects to Cognito logout
   */
  const signOut = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Clear local state first
      clearStoredAuth();
      setAuthState(defaultAuthState);

      // Use the auth service class instance
      await authService.initiateSignOut();
    } catch (error) {
      // Even if sign out fails, clear local state
      setAuthState({
        ...defaultAuthState,
        error: error instanceof Error ? error.message : "Sign out failed",
      });
    }
  };

  /**
   * Refresh authentication tokens
   */
  const refreshTokens = async (): Promise<void> => {
    try {
      if (!authState.tokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use the auth service class instance
      const { user, tokens } = await authService.refreshTokens(
        authState.tokens.refreshToken
      );

      storeAuth(user, tokens);
      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // If refresh fails, sign out the user
      clearStoredAuth();
      setAuthState({
        ...defaultAuthState,
        error: error instanceof Error ? error.message : "Token refresh failed",
      });
    }
  };

  /**
   * Set user and tokens after successful authentication
   * This will be called by the auth callback handler
   */
  const setAuthenticated = useCallback((user: User, tokens: AuthTokens) => {
    storeAuth(user, tokens);
    setAuthState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear any error state
   */
  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshTokens,
    clearError,
  };

  // Add setAuthenticated to window for the auth callback to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      (
        window as Window & {
          __nimbus_setAuthenticated?: typeof setAuthenticated;
        }
      ).__nimbus_setAuthenticated = setAuthenticated;
    }
  }, [setAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
