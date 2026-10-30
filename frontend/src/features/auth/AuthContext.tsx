import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { getCurrentUser, renewSession } from "./authApi";
import {
  clearStoredAuth,
  readStoredAuth,
  storeAuth,
  startStoredSession,
  AUTH_STORAGE_KEY,
  recordActivity,
  readSession,
  storedSessionEndReason,
} from "./authStorage";
import { SESSION_ENDED_EVENT, SESSION_EXPIRED_EVENT, startSessionMonitor } from "./sessionMonitor";
import type { SessionEndReason } from "./sessionMonitor";
import { showErrorAlert } from "../../shared/utils/alerts";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "./authContextValue";
import type AuthResponse from "./types/authResponse";

const CURRENT_USER_KEY = ["current-user"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [storedAuth, setStoredAuth] = useState(readStoredAuth);
  // Revalidate a saved session with the backend on startup, while keeping its token for authenticated requests.
  const { data, isLoading, error } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = { ...currentUser, token: storedAuth?.token ?? null };
        return session;
      } catch (requestError) {
        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
          return null;
        }
        throw requestError;
      }
    },
    enabled: Boolean(storedAuth?.token),
    initialData: storedAuth,
    retry: false,
  });

  useEffect(() => {
    const clearUser = () => {
      setStoredAuth(null);
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      queryClient.clear();
    };
    const notifyEnd = (reason: SessionEndReason) => {
      window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT, { detail: reason }));
    };
    const expire = (reason: SessionEndReason) => {
      if (!readStoredAuth()) return;
      clearStoredAuth(reason);
      clearUser();
      notifyEnd(reason);
    };
    const onExpired = (event: Event) => {
      if (event instanceof CustomEvent && (event.detail === "inactive" || event.detail === "expired")) {
        expire(event.detail);
      }
    };
    // Login, logout, and account changes in another tab must update this tab's auth state and cached data.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY && event.key !== null) return;
      const auth = readStoredAuth();
      if (auth) {
        const previousUser = queryClient.getQueryData<AuthResponse | null>(CURRENT_USER_KEY);
        if (previousUser?.email !== auth.email || previousUser?.role !== auth.role) {
          queryClient.clear();
        }
        queryClient.setQueryData(CURRENT_USER_KEY, auth);
        setStoredAuth(auth);
      } else {
        clearUser();
        const reason = storedSessionEndReason();
        if (reason) notifyEnd(reason);
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener("storage", onStorage);
    const stop = startSessionMonitor({
      activityTarget: window,
      visibilityTarget: document,
      readSession,
      recordActivity,
      expire,
      renew: async (token) => {
        const session = await renewSession();
        // A response from an old session must not undo logout or a newer login.
        if (readStoredAuth()?.token !== token) return;
        storeAuth(session);
        queryClient.setQueryData(CURRENT_USER_KEY, session);
        setStoredAuth(session);
      },
      reportError: () => {
        void showErrorAlert(
          "Unable to renew your session. Check your connection. If your session expires, please log in again.",
          "Session renewal failed",
        );
      },
    });
    return () => {
      stop();
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener("storage", onStorage);
    };
  }, [queryClient]);

  const errorMessage = error
    ? "Unable to verify your session. Check that the backend is running."
    : null;
  const value = useMemo<AuthContextValue>(() => ({
    user: storedAuth ? data ?? storedAuth : null,
    isLoading,
    errorMessage,
    setUser: (user: AuthResponse) => {
      startStoredSession(user);
      setStoredAuth(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
    },
    logout: async () => {
      clearStoredAuth();
      setStoredAuth(null);
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
      queryClient.clear();
    },
  }), [data, errorMessage, isLoading, queryClient, storedAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
