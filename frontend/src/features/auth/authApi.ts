const API_BASE_URL = "http://localhost:8080/api";

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

async function parseErrorResponse(response: Response): Promise<never> {
  let data: any = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("Something went wrong. Please try again.");
  }

  /**
   * Handles:
   * {
   *   "message": "Invalid credentials"
   * }
   */
  if (typeof data.message === "string") {
    throw new Error(data.message);
  }

  /**
   * Handles your validation format:
   * {
   *   "message": {
   *     "password": "Password must be at least 8 characters"
   *   }
   * }
   */
  if (
    typeof data.message === "object" &&
    data.message !== null &&
    !Array.isArray(data.message)
  ) {
    const firstMessage = Object.values(data.message)[0];

    if (typeof firstMessage === "string") {
      throw new Error(firstMessage);
    }
  }

  /**
   * Handles:
   * {
   *   "password": "Password must be at least 8 characters"
   * }
   */
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const firstError = Object.values(data)[0];

    if (typeof firstError === "string") {
      throw new Error(firstError);
    }
  }

  throw new Error("Request failed. Please check your input.");
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
}