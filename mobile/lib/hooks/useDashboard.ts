import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useDashboardStore } from '@/lib/stores/dashboard';
import type { DashboardResponse } from '@/lib/types';

interface UseDashboardReturn {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const { data, isLoading, error, fetchDashboard } = useDashboardStore();

  // Re-fetch when tab gains focus (also fires on initial mount)
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const refresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refresh };
}
