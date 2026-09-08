import apiClient from "../../lib/apiClient";
import type AuthResponse from "./types/authResponse";
import type RegisterRequest from "./types/registerRequest";
import type LoginRequest from "./types/loginRequest";

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
  payload: RegisterRequest
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
  payload: LoginRequest
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