import { useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { getCurrentUser } from "./authApi";
import {
  clearStoredAuth,
  readStoredAuth,
  storeAuth,
} from "./authStorage";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "./authContextValue";
import type AuthResponse from "./types/authResponse";

const CURRENT_USER_KEY = ["current-user"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const storedAuth = readStoredAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = { ...currentUser, token: storedAuth?.token ?? null };
        if (session.token) {
          storeAuth(session);
        }
        return session;
      } catch (requestError) {
        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
          clearStoredAuth();
          return null;
        }
        throw requestError;
      }
    },
    enabled: Boolean(storedAuth?.token),
    initialData: storedAuth,
    retry: false,
  });

  const errorMessage = error
    ? "Unable to verify your session. Check that the backend is running."
    : null;
  const value = useMemo<AuthContextValue>(() => ({
    user: data ?? null,
    isLoading,
    errorMessage,
    setUser: (user: AuthResponse) => {
      storeAuth(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
    },
    logout: async () => {
      clearStoredAuth();
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
      queryClient.clear();
    },
  }), [data, errorMessage, isLoading, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
