import { apiClient } from './client';
import type { Category, CreateCategoryInput } from '@/lib/types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/', {
      params: { page_size: 100 },
    });
    return response.data.results;
  },

  async create(data: CreateCategoryInput): Promise<Category> {
    const response = await apiClient.post<Category>('/categories/', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryInput> & { is_archived?: boolean }): Promise<Category> {
    const response = await apiClient.patch<Category>(`/categories/${id}/`, data);
    return response.data;
  },
};
