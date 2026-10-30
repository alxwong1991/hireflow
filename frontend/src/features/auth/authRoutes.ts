import type { UserRole } from "./types/userRole";

export function profilePathForRole(role: UserRole): string {
  return role === "EMPLOYEE" ? "/employee/profile" : "/employer/profile";
}
