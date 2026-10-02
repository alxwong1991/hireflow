import type { UserRole } from "./userRole";

export default interface RegisterRequest {
  fullName?: string;
  companyName?: string;
  displayName?: string;
  email: string;
  password: string;
  role: UserRole;
}