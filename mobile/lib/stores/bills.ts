import { create } from 'zustand';
import { billsApi } from '@/lib/api/bills';
import type { CreateRecurringBillInput, RecurringBill, UpdateRecurringBillInput } from '@/lib/types';

interface BillsState {
  bills: RecurringBill[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  fetchBills: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  createBill: (data: CreateRecurringBillInput) => Promise<RecurringBill>;
  updateBill: (id: string, data: UpdateRecurringBillInput) => Promise<RecurringBill>;
  deleteBill: (id: string) => Promise<void>;
  reset: () => void;
}

const PAGE_SIZE = 20;

export const useBillsStore = create<BillsState>((set, get) => ({
  bills: [],
  count: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  fetchBills: async (reset = true) => {
    if (reset) {
      set({ isLoading: true, error: null, page: 1, bills: [] });
    }

    try {
      const response = await billsApi.list(reset ? 1 : get().page, PAGE_SIZE);
      set((state) => ({
        bills: reset ? response.results : [...state.bills, ...response.results],
        count: response.count,
        hasMore: !!response.next,
        page: reset ? 1 : state.page,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch {
      set({
        error: 'Erreur lors du chargement des factures',
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
      const response = await billsApi.list(nextPage, PAGE_SIZE);
      set((state) => ({
        bills: [...state.bills, ...response.results],
        count: response.count,
        hasMore: !!response.next,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false, page });
    }
  },

  createBill: async (data) => {
    const bill = await billsApi.create(data);
    set((state) => ({
      bills: [bill, ...state.bills],
      count: state.count + 1,
    }));
    return bill;
  },

  updateBill: async (id, data) => {
    const updated = await billsApi.update(id, data);
    set((state) => ({
      bills: state.bills.map((bill) => (bill.id === id ? updated : bill)),
    }));
    return updated;
  },

  deleteBill: async (id) => {
    await billsApi.delete(id);
    set((state) => ({
      bills: state.bills.filter((bill) => bill.id !== id),
      count: Math.max(0, state.count - 1),
    }));
  },

  reset: () => set({
    bills: [],
    count: 0,
    page: 1,
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  }),
}));
