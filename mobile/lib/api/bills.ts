import { apiClient } from './client';
import type {
  CreateRecurringBillInput,
  PaginatedResponse,
  RecurringBill,
  UpdateRecurringBillInput,
} from '@/lib/types';

export const billsApi = {
  async list(page = 1, pageSize = 20): Promise<PaginatedResponse<RecurringBill>> {
    const response = await apiClient.get<PaginatedResponse<RecurringBill>>('/bills/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async create(data: CreateRecurringBillInput): Promise<RecurringBill> {
    const response = await apiClient.post<RecurringBill>('/bills/', data);
    return response.data;
  },

  async get(id: string): Promise<RecurringBill> {
    const response = await apiClient.get<RecurringBill>(`/bills/${id}/`);
    return response.data;
  },

  async update(id: string, data: UpdateRecurringBillInput): Promise<RecurringBill> {
    const response = await apiClient.patch<RecurringBill>(`/bills/${id}/`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bills/${id}/`);
  },
};
