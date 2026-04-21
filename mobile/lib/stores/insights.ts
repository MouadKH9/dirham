import { create } from 'zustand';
import { insightsApi } from '@/lib/api/insights';
import type { AIInsight } from '@/lib/types';

interface InsightsState {
  insights: AIInsight[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  fetchInsights: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

const PAGE_SIZE = 20;

export const useInsightsStore = create<InsightsState>((set, get) => ({
  insights: [],
  count: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  fetchInsights: async (reset = true) => {
    if (reset) {
      set({ isLoading: true, error: null, page: 1, insights: [] });
    }

    try {
      const response = await insightsApi.list({
        page: reset ? 1 : get().page,
        page_size: PAGE_SIZE,
      });

      set((state) => ({
        insights: reset ? response.results : [...state.insights, ...response.results],
        count: response.count,
        hasMore: response.next !== null,
        page: reset ? 1 : state.page,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch {
      set({
        error: 'Erreur lors du chargement des insights',
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  loadMore: async () => {
    const { isLoading, isLoadingMore, hasMore, page } = get();
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true, page: nextPage });

    try {
      const response = await insightsApi.list({
        page: nextPage,
        page_size: PAGE_SIZE,
      });

      set((state) => ({
        insights: [...state.insights, ...response.results],
        count: response.count,
        hasMore: response.next !== null,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false, page });
    }
  },

  markAsRead: async (id) => {
    const previousInsights = get().insights;
    const target = previousInsights.find((insight) => insight.id === id);
    if (!target || target.is_read) return;

    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === id ? { ...insight, is_read: true } : insight,
      ),
    }));

    try {
      await insightsApi.markRead(id);
    } catch {
      set({ insights: previousInsights });
    }
  },

  markAllAsRead: async () => {
    const previousInsights = get().insights;
    const unreadIds = previousInsights.filter((insight) => !insight.is_read).map((insight) => insight.id);
    if (unreadIds.length === 0) return;

    set((state) => ({
      insights: state.insights.map((insight) => ({ ...insight, is_read: true })),
    }));

    try {
      await Promise.all(unreadIds.map(async (id) => insightsApi.markRead(id)));
    } catch {
      set({ insights: previousInsights });
    }
  },

  reset: () => set({
    insights: [],
    count: 0,
    page: 1,
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  }),
}));
