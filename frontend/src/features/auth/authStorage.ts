import type AuthResponse from "./types/authResponse";
import type { SessionEndReason, SessionSnapshot } from "./sessionMonitor";

export const AUTH_STORAGE_KEY = "hireflow_auth";
const LAST_ACTIVITY_KEY = "hireflow_last_activity";
const SESSION_END_KEY = "hireflow_session_end";

export function readStoredAuth(): AuthResponse | null {
  const value = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) {
    return null;
  }
  try {
    const auth = JSON.parse(value) as AuthResponse;
    return auth.token && auth.email && auth.role ? auth : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function startStoredSession(auth: AuthResponse): void {
  localStorage.removeItem(SESSION_END_KEY);
  // Keep the inactivity deadline separate from the JWT so reloads and other tabs share the same activity state.
  recordActivity(Date.now());
  storeAuth(auth);
}

export function recordActivity(now: number): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
}

export function readSession(): SessionSnapshot | null {
  const token = getStoredToken();
  return token ? { token, lastActivity: Number(localStorage.getItem(LAST_ACTIVITY_KEY)) } : null;
}

export function storedSessionEndReason(): SessionEndReason | null {
  const reason = localStorage.getItem(SESSION_END_KEY);
  return reason === "inactive" || reason === "expired" ? reason : null;
}

export function clearStoredAuth(reason?: SessionEndReason): void {
  localStorage.setItem(SESSION_END_KEY, reason ?? "logout");
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function getStoredToken(): string | null {
  return readStoredAuth()?.token ?? null;
}
