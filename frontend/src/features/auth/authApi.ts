import { apiClient } from "../../lib/apiClient";

export type UserRole = "EMPLOYEE" | "EMPLOYER";

export type RegisterPayload = {
  fullName?: string;
  companyName?: string;
  displayName?: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  userId: number;
  email: string;
  displayName: string;
  role: UserRole;
  employeeProfileId: number | null;
  employerProfileId: number | null;
  message: string;
};

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: any;
      };
    };

    const data = axiosError.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (
      typeof data?.message === "object" &&
      data.message !== null &&
      !Array.isArray(data.message)
    ) {
      const firstMessage = Object.values(data.message)[0];

      if (typeof firstMessage === "string") {
        return firstMessage;
      }
    }

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const firstError = Object.values(data)[0];

      if (typeof firstError === "string") {
        return firstError;
      }
    }
  }

  return "Something went wrong. Please try again.";
}

export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload
    );

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function loginUser(
  payload: LoginPayload
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      payload
    );

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}