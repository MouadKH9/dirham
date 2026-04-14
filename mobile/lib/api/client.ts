import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Keys for token storage
export const ACCESS_TOKEN_KEY = 'dirham_access_token';
export const REFRESH_TOKEN_KEY = 'dirham_refresh_token';

// Base URL — update when deploying; use env var or constant
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// Plain axios instance used ONLY for refresh calls (no interceptor to avoid infinite loop)
const plainAxios = axios.create({ baseURL: API_BASE_URL });

// The main axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Refresh queue mutex
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

// Request interceptor — attach access token and Accept-Language
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Language will be set dynamically by the settings store
  // Default to 'fr' here as fallback
  if (!config.headers['Accept-Language']) {
    config.headers['Accept-Language'] = 'fr';
  }
  return config;
});

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh is done
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token');

      const response = await plainAxios.post<{ access: string; refresh: string }>(
        '/auth/refresh/',
        { refresh: refreshToken }
      );

      const { access, refresh } = response.data;
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);

      // Update default header for future requests
      apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;

      processQueue(null, access);
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear tokens and trigger logout
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      // Import dynamically to avoid circular dependency
      const { useAuthStore } = await import('@/lib/stores/auth');
      useAuthStore.getState()._clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper to set Accept-Language header (called by settings store on language change)
export function setApiLanguage(lang: string) {
  apiClient.defaults.headers.common['Accept-Language'] = lang;
}
