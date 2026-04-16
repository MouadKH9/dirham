import { create } from 'zustand';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardResponse } from '@/lib/types';

interface DashboardState {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardApi.get();
      set({ data, isLoading: false });
    } catch {
      set({ error: 'Erreur lors du chargement du tableau de bord', isLoading: false });
    }
  },

  reset: () => set({ data: null, isLoading: false, error: null }),
}));
