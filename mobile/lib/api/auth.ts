import axios from 'axios';
import { apiClient, API_BASE_URL } from './client';
import type { AuthTokens, User } from '@/lib/types';

// Plain axios instance for refresh — avoids triggering the 401 interceptor
const plainAxios = axios.create({ baseURL: API_BASE_URL });

export async function refreshToken(refresh: string): Promise<{ access: string; refresh: string }> {
  const response = await plainAxios.post<{ access: string; refresh: string }>('/auth/refresh/', { refresh });
  return response.data;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  async register(email: string, password: string, preferred_language = 'fr'): Promise<AuthResponse> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register/', {
      email,
      password,
      preferred_language,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    // Login returns {access, refresh, user} — normalize to same shape as register
    const response = await apiClient.post<{ access: string; refresh: string; user: User }>('/auth/login/', {
      email,
      password,
    });
    return {
      user: response.data.user,
      tokens: { access: response.data.access, refresh: response.data.refresh },
    };
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },
};
