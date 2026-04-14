import { apiClient } from './client';
import type { DashboardData } from '@/lib/types';

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/dashboard/');
    return response.data;
  },
};
