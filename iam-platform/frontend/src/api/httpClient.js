import axios from 'axios';

// Base URL: In local dev, Vite proxy handles '/api' when VITE_API_BASE_URL is not set or relative.
// If VITE_API_BASE_URL is explicitly set to http://localhost:8080, it will use that.
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let getStoredToken = () => null;
let getStoredRefreshToken = () => null;
let updateTokens = () => {};
let onAuthFailure = () => {};

export function configureTokenProvider({
  getToken,
  getRefreshToken,
  onTokenRefreshed,
  onLogout,
}) {
  getStoredToken = getToken;
  getStoredRefreshToken = getRefreshToken;
  updateTokens = onTokenRefreshed;
  onAuthFailure = onLogout;
}

// Request Interceptor: Attach Bearer Token
httpClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency control for token refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: 401 Auto-Refresh and Error Normalization
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Normalize error payload from backend ApiError
    const status = error.response?.status;
    const errorData = error.response?.data;
    const message =
      errorData?.message ||
      (status === 401
        ? 'Invalid or expired credentials'
        : status === 403
        ? 'Access forbidden'
        : status === 404
        ? 'Requested resource not found'
        : error.message || 'Network error occurred');

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.validationErrors = errorData?.validationErrors || {};
    normalizedError.originalError = error;

    // Do NOT refresh if this was the refresh endpoint itself or login/register endpoint
    const isAuthEndpoint =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/register') ||
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/logout');

    // Only attempt refresh on 401 for authenticated endpoints, once per request
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = getStoredRefreshToken();

      if (!refreshToken) {
        onAuthFailure();
        return Promise.reject(normalizedError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newLoginData = refreshResponse.data;
        updateTokens(newLoginData);
        processQueue(null, newLoginData.accessToken);

        originalRequest.headers.Authorization = `Bearer ${newLoginData.accessToken}`;
        return httpClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        onAuthFailure();
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);
