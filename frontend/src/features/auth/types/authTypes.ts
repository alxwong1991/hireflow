export type UserRole = "EMPLOYEE" | "EMPLOYER";

export type AuthResponse = {
  userId: number;
  email: string;
  displayName: string;
  role: UserRole;
  employeeProfileId: number | null;
  employerProfileId: number | null;
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  companyName?: string;
};