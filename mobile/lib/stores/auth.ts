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
      // Set token on client and validate with lightweight /auth/me/ endpoint
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      const meResponse = await apiClient.get<User>('/auth/me/');
      const freshUser = meResponse.data;

      // Also try to load saved user from SecureStore (for display while in flight)
      const savedUser = await SecureStore.getItemAsync('dirham_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser?.id || !parsedUser?.email) {
          // stale/invalid user shape, treat as unauthenticated
          set({ isAuthenticated: false, isLoading: false });
          return;
        }
      }

      set({ user: freshUser, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const { user, tokens } = await authApi.login(email, password);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
      await SecureStore.setItemAsync('dirham_user', JSON.stringify(user));
      apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      set({ isLoading: false, error: message });
    }
  },

  register: async (email, password, language = 'fr') => {
    set({ error: null, isLoading: true });
    try {
      const { user, tokens } = await authApi.register(email, password, language);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
      await SecureStore.setItemAsync('dirham_user', JSON.stringify(user));
      apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      set({ isLoading: false, error: message });
    }
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
