import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/lib/api/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, apiClient } from '@/lib/api/client';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true during initial checkAuth
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, language?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  _clearAuth: () => void; // Called by api/client on refresh failure
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      // Set token on client and try to fetch dashboard to validate
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      // Try a lightweight call — if it fails, the interceptor will attempt refresh
      const { dashboardApi } = await import('@/lib/api/dashboard');
      await dashboardApi.get();
      // If we get here, token is valid — we don't have user object from this endpoint
      // so we reconstruct minimal user from secure store if saved
      const savedUser = await SecureStore.getItemAsync('dirham_user');
      if (savedUser) {
        set({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    const { user, tokens } = await authApi.login(email, password);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
    await SecureStore.setItemAsync('dirham_user', JSON.stringify(user));
    apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;
    set({ user, isAuthenticated: true });
  },

  register: async (email, password, language = 'fr') => {
    set({ error: null });
    const { user, tokens } = await authApi.register(email, password, language);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
    await SecureStore.setItemAsync('dirham_user', JSON.stringify(user));
    apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Ignore logout API errors — clear local state regardless
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('dirham_user');
    delete apiClient.defaults.headers.common.Authorization;
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

  _clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
