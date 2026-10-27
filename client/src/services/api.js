
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Call this when the app needs to restore a session,
// or when a protected API request returns 401.
export const refreshAccessToken = async ({ force = false } = {}) => {
  console.count('refreshAccessToken() called');
console.trace('Refresh call stack');
  if (!force && accessToken) {
    return { accessToken };
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const data = response.data?.data;

        if (!data?.accessToken) {
          throw new Error('Refresh response did not include an access token');
        }

        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const excludedRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ];

    if (
      excludedRoutes.some((route) => requestUrl.includes(route)) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Another request may already have refreshed the token.
    const tokenUsed = originalRequest.headers?.Authorization;
    if (accessToken && tokenUsed !== `Bearer ${accessToken}`) {
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    }

    try {
      const data = await refreshAccessToken({ force: true });

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
