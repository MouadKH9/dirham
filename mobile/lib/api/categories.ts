import { apiClient } from './client';
import type { Category, CreateCategoryInput } from '@/lib/types';

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories/');
    return response.data;
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
