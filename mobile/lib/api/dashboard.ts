import { apiClient } from './client';
import type { DashboardResponse } from '@/lib/types';

export const dashboardApi = {
  async get(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>('/dashboard/');
    return response.data;
  },
};
