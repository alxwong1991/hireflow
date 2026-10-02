import type { UserRole } from "./userRole";

export default interface AuthResponse {
  token: string | null;
  email: string;
  displayName: string;
  role: UserRole;
  message: string;
}