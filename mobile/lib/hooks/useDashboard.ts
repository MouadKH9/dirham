import { useCallback, useEffect, useState } from 'react';
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

  // Fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Re-fetch when tab gains focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const refresh = useCallback(() => {
    fetchDashboard();
  }, []);

  return { data, isLoading, error, refresh };
}
