/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

const AuthContext = createContext<{
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  getFreshToken: () => Promise<string | null>;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  getFreshToken: async () => null,
});

import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isSignedIn } = useClerkAuth();
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    async function updateAuthState() {
      if (!userLoaded) return;

      try {
        const token = isSignedIn ? await getToken() : null;
        setAuthState({
          user: user || null,
          isAuthenticated: !!isSignedIn,
          isLoading: false,
          token,
        });
      } catch (error) {
        console.error("Error updating auth state:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null,
        });
      }
    }

    updateAuthState();
  }, [user, userLoaded, isSignedIn, getToken]);

  const value = {
    ...authState,
    // Add utility functions if needed
    getFreshToken: async () => {
      return isSignedIn ? await getToken() : null;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}