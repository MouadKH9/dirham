import { apiClient } from './client';
import type { Account, CreateAccountInput } from '@/lib/types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const accountsApi = {
  async list(): Promise<Account[]> {
    const response = await apiClient.get<PaginatedResponse<Account>>('/accounts/', {
      params: { page_size: 100 },
    });
    return response.data.results;
  },

  async create(data: CreateAccountInput): Promise<Account> {
    const response = await apiClient.post<Account>('/accounts/', data);
    return response.data;
  },

  async get(id: string): Promise<Account> {
    const response = await apiClient.get<Account>(`/accounts/${id}/`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAccountInput>): Promise<Account> {
    const response = await apiClient.patch<Account>(`/accounts/${id}/`, data);
    return response.data;
  },
};
