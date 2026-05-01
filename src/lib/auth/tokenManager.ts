/**
 * Token management module
 * Handles token storage, retrieval, and refresh with automatic retry logic
 */

import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = "pinuss-flix-auth";

// Lock to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Get tokens from localStorage
 */
export function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const tokens = parsed?.state?.tokens;

    if (tokens?.accessToken && tokens?.refreshToken) {
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save tokens to localStorage
 */
export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    const parsed = stored ? JSON.parse(stored) : {};

    localStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({
        ...parsed,
        state: {
          ...parsed.state,
          tokens,
          isAuthenticated: true,
        },
      })
    );
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
}

/**
 * Clear tokens from localStorage (triggers logout)
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      localStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({
          ...parsed,
          state: {
            ...parsed.state,
            tokens: null,
            user: null,
            isAuthenticated: false,
          },
        })
      );
    }
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  const tokens = getTokens();

  if (!tokens?.refreshToken) {
    clearTokens();
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccessToken = response.data.accessToken;

    // Save the new access token
    saveTokens({
      accessToken: newAccessToken,
      refreshToken: tokens.refreshToken,
    });

    return newAccessToken;
  } catch (error) {
    clearTokens();
    // Emit event to notify AuthProvider
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:token-refresh-failed"));
    }
    throw error;
  }
}

/**
 * Axios response interceptor for handling 401 errors and token refresh
 */
export function createAuthInterceptor() {
  return async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        // Process queued requests with new token
        processQueue(null, newToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  };
}

interface AxiosRequestConfig {
  headers?: Record<string, string>;
}

/**
 * Get authorization header with current token
 */
export function getAuthHeader(): string | null {
  const tokens = getTokens();
  return tokens?.accessToken ? `Bearer ${tokens.accessToken}` : null;
}
