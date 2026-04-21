import { apiClient } from './client';
import type {
  Budget,
  CreateRecurringBudgetInput,
  CreateBudgetInput,
  PaginatedResponse,
  RecurringBudget,
  UpdateRecurringBudgetInput,
  UpdateBudgetInput,
} from '@/lib/types';

export const budgetsApi = {
  async list(page = 1, pageSize = 20): Promise<PaginatedResponse<Budget>> {
    const response = await apiClient.get<PaginatedResponse<Budget>>('/budgets/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async create(data: CreateBudgetInput): Promise<Budget> {
    const response = await apiClient.post<Budget>('/budgets/', data);
    return response.data;
  },

  async get(id: string): Promise<Budget> {
    const response = await apiClient.get<Budget>(`/budgets/${id}/`);
    return response.data;
  },

  async update(id: string, data: UpdateBudgetInput): Promise<Budget> {
    const response = await apiClient.patch<Budget>(`/budgets/${id}/`, data);
    return response.data;
  },

  async listRecurring(page = 1, pageSize = 20): Promise<PaginatedResponse<RecurringBudget>> {
    const response = await apiClient.get<PaginatedResponse<RecurringBudget>>('/recurring-budgets/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async createRecurring(data: CreateRecurringBudgetInput): Promise<RecurringBudget> {
    const response = await apiClient.post<RecurringBudget>('/recurring-budgets/', data);
    return response.data;
  },

  async getRecurring(id: string): Promise<RecurringBudget> {
    const response = await apiClient.get<RecurringBudget>(`/recurring-budgets/${id}/`);
    return response.data;
  },

  async updateRecurring(id: string, data: UpdateRecurringBudgetInput): Promise<RecurringBudget> {
    const response = await apiClient.patch<RecurringBudget>(`/recurring-budgets/${id}/`, data);
    return response.data;
  },
};
