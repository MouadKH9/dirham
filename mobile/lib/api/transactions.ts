import { apiClient } from './client';
import type { CreateTransactionInput, PaginatedResponse, Transaction, TransactionFilters } from '@/lib/types';

export interface TransactionSummary {
  income: string;
  expense: string;
  bill: string;
  net: string;
  month: string;
}

export const transactionsApi = {
  async list(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
    const params: Record<string, string | number> = {};
    if (filters.type) params.type = filters.type;
    if (filters.account) params.account = filters.account;
    if (filters.category) params.category = filters.category;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.search) params.search = filters.search;
    if (filters.ordering) params.ordering = filters.ordering;
    if (filters.page) params.page = filters.page;
    if (filters.page_size) params.page_size = filters.page_size;

    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions/', { params });
    return response.data;
  },

  async create(data: CreateTransactionInput): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions/', data);
    return response.data;
  },

  async get(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}/`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTransactionInput>): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(`/transactions/${id}/`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}/`);
  },

  async summary(month?: string): Promise<TransactionSummary> {
    const params = month ? { month } : {};
    const response = await apiClient.get<TransactionSummary>('/transactions/summary/', { params });
    return response.data;
  },
};
