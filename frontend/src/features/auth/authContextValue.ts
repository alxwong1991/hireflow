import { createContext, useContext } from "react";

import type AuthResponse from "./types/authResponse";
import type { UserRole } from "./types/userRole";

export interface AuthContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
  setUser: (user: AuthResponse) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function hasRole(user: AuthResponse | null, role: UserRole): boolean {
  return user?.role === role;
}
