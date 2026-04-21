import { create } from 'zustand';
import { budgetsApi } from '@/lib/api/budgets';
import type {
  Budget,
  CreateBudgetInput,
  CreateRecurringBudgetInput,
  RecurringBudget,
  UpdateBudgetInput,
  UpdateRecurringBudgetInput,
} from '@/lib/types';

interface BudgetsState {
  budgets: Budget[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  recurringBudgets: RecurringBudget[];
  recurringCount: number;
  recurringPage: number;
  recurringHasMore: boolean;
  isRecurringLoading: boolean;
  isRecurringLoadingMore: boolean;

  fetchBudgets: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  createBudget: (data: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (id: string, data: UpdateBudgetInput) => Promise<Budget>;
  fetchRecurringBudgets: (reset?: boolean) => Promise<void>;
  createRecurringBudget: (data: CreateRecurringBudgetInput) => Promise<RecurringBudget>;
  updateRecurringBudget: (id: string, data: UpdateRecurringBudgetInput) => Promise<RecurringBudget>;
  reset: () => void;
}

const PAGE_SIZE = 20;

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  count: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  recurringBudgets: [],
  recurringCount: 0,
  recurringPage: 1,
  recurringHasMore: false,
  isRecurringLoading: false,
  isRecurringLoadingMore: false,

  fetchBudgets: async (reset = true) => {
    if (reset) {
      set({ isLoading: true, error: null, page: 1, budgets: [] });
    }
    try {
      const response = await budgetsApi.list(reset ? 1 : get().page, PAGE_SIZE);
      set((state) => ({
        budgets: reset ? response.results : [...state.budgets, ...response.results],
        count: response.count,
        hasMore: !!response.next,
        page: reset ? 1 : state.page,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch {
      set({
        error: 'Erreur lors du chargement des budgets',
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
      const response = await budgetsApi.list(nextPage, PAGE_SIZE);
      set((state) => ({
        budgets: [...state.budgets, ...response.results],
        count: response.count,
        hasMore: !!response.next,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false, page });
    }
  },

  createBudget: async (data) => {
    const budget = await budgetsApi.create(data);
    set((state) => ({
      budgets: [budget, ...state.budgets],
      count: state.count + 1,
    }));
    return budget;
  },

  updateBudget: async (id, data) => {
    const updated = await budgetsApi.update(id, data);
    set((state) => ({
      budgets: state.budgets.map((budget) => (budget.id === id ? updated : budget)),
    }));
    return updated;
  },

  fetchRecurringBudgets: async (reset = true) => {
    if (reset) {
      set({ isRecurringLoading: true, recurringPage: 1, recurringBudgets: [] });
    }

    try {
      const response = await budgetsApi.listRecurring(reset ? 1 : get().recurringPage, PAGE_SIZE);
      set((state) => ({
        recurringBudgets: reset ? response.results : [...state.recurringBudgets, ...response.results],
        recurringCount: response.count,
        recurringHasMore: !!response.next,
        recurringPage: reset ? 1 : state.recurringPage,
        isRecurringLoading: false,
        isRecurringLoadingMore: false,
      }));
    } catch {
      set({
        isRecurringLoading: false,
        isRecurringLoadingMore: false,
      });
    }
  },

  createRecurringBudget: async (data) => {
    const recurring = await budgetsApi.createRecurring(data);
    set((state) => ({
      recurringBudgets: [recurring, ...state.recurringBudgets],
      recurringCount: state.recurringCount + 1,
    }));
    return recurring;
  },

  updateRecurringBudget: async (id, data) => {
    const updated = await budgetsApi.updateRecurring(id, data);
    set((state) => ({
      recurringBudgets: state.recurringBudgets.map((budget) => (budget.id === id ? updated : budget)),
    }));
    return updated;
  },

  reset: () => set({
    budgets: [],
    count: 0,
    page: 1,
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    recurringBudgets: [],
    recurringCount: 0,
    recurringPage: 1,
    recurringHasMore: false,
    isRecurringLoading: false,
    isRecurringLoadingMore: false,
  }),
}));
