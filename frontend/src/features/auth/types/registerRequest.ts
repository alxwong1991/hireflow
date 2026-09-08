import type { UserRole } from "./userRole";

type RegisterRequest = {
  fullName?: string;
  companyName?: string;
  displayName?: string;
  email: string;
  password: string;
  role: UserRole;
};

export default RegisterRequest;