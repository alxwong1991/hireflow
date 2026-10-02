import type AuthResponse from "./types/authResponse";

const AUTH_STORAGE_KEY = "hireflow_auth";

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

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return readStoredAuth()?.token ?? null;
}
