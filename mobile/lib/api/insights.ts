import { apiClient } from './client';
import type { AIInsight, InsightFilters, PaginatedResponse } from '@/lib/types';

export const insightsApi = {
  async list(filters: InsightFilters = {}): Promise<PaginatedResponse<AIInsight>> {
    const params: Record<string, string | number | boolean> = {};
    if (typeof filters.is_read === 'boolean') params.is_read = filters.is_read;
    if (filters.type) params.type = filters.type;
    if (filters.page) params.page = filters.page;
    if (filters.page_size) params.page_size = filters.page_size;

    const response = await apiClient.get<PaginatedResponse<AIInsight>>('/insights/', { params });
    return response.data;
  },

  async markRead(id: string): Promise<AIInsight> {
    const response = await apiClient.patch<AIInsight>(`/insights/${id}/`, { is_read: true });
    return response.data;
  },
};
