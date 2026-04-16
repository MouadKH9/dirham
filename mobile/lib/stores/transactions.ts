import { create } from 'zustand';
import { transactionsApi } from '@/lib/api/transactions';
import type { CreateTransactionInput, Transaction, TransactionFilters } from '@/lib/types';

interface TransactionsState {
  transactions: Transaction[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: TransactionFilters;

  fetchTransactions: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  createTransaction: (data: CreateTransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  reset: () => void;
}

const PAGE_SIZE = 20;

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  count: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  filters: {},

  fetchTransactions: async (reset = true) => {
    const { filters } = get();
    if (reset) {
      set({ isLoading: true, error: null, page: 1, transactions: [] });
    }
    try {
      const response = await transactionsApi.list({
        ...filters,
        page: reset ? 1 : get().page,
        page_size: PAGE_SIZE,
      });
      set({
        transactions: reset ? response.results : [...get().transactions, ...response.results],
        count: response.count,
        hasMore: response.next !== null,
        page: reset ? 1 : get().page,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch {
      set({ error: 'Erreur lors du chargement des transactions', isLoading: false, isLoadingMore: false });
    }
  },

  loadMore: async () => {
    const { isLoading, isLoadingMore, hasMore, page, filters } = get();
    if (isLoading || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    set({ isLoadingMore: true, page: nextPage });
    try {
      const response = await transactionsApi.list({ ...filters, page: nextPage, page_size: PAGE_SIZE });
      set((state) => ({
        transactions: [...state.transactions, ...response.results],
        count: response.count,
        hasMore: !!response.next,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  clearFilters: () => set({ filters: {} }),

  createTransaction: async (data) => {
    const transaction = await transactionsApi.create(data);
    set((state) => ({ transactions: [transaction, ...state.transactions], count: state.count + 1 }));
    return transaction;
  },

  deleteTransaction: async (id) => {
    await transactionsApi.delete(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      count: state.count - 1,
    }));
  },

  reset: () => set({ transactions: [], count: 0, page: 1, hasMore: false, isLoading: false, error: null, filters: {} }),
}));
