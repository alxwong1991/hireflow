import type { UserRole } from "./userRole";

type AuthResponse = {
  userId: number;
  email: string;
  displayName: string;
  role: UserRole;
  employeeProfileId: number | null;
  employerProfileId: number | null;
  message: string;
};

export default AuthResponse;