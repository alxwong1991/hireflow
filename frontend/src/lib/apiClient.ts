import axios from "axios";

import { readSession } from "../features/auth/authStorage";
import { SESSION_EXPIRED_EVENT, sessionEndReason } from "../features/auth/sessionMonitor";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = readSession();
  const reason = session && sessionEndReason(session);
  if (reason) {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: reason }));
    throw new axios.CanceledError("Your session has ended. Please log in again.");
  }
  // Centralize bearer-token attachment so feature API modules do not manage auth headers themselves.
  const token = session?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // A 401 from a request made with this session's token means the client session is no longer usable.
    if (
      axios.isAxiosError(error) && error.response?.status === 401 &&
      error.config?.headers.Authorization === `Bearer ${readSession()?.token}`
    ) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: "expired" }));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
