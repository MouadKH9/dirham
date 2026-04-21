import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useInsightsStore } from '@/lib/stores/insights';
import type { AIInsight } from '@/lib/types';

interface UseInsightsReturn {
  insights: AIInsight[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export function useInsights(): UseInsightsReturn {
  const {
    insights,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchInsights,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useInsightsStore();

  useFocusEffect(
    useCallback(() => {
      void fetchInsights(true);

      return () => {
        void markAllAsRead();
      };
    }, [fetchInsights, markAllAsRead]),
  );

  const refresh = useCallback(async () => {
    await fetchInsights(true);
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    markAsRead,
  };
}
