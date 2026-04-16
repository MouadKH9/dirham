import { create } from 'zustand';
import { accountsApi } from '@/lib/api/accounts';
import type { Account, CreateAccountInput } from '@/lib/types';

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;

  fetchAccounts: () => Promise<void>;
  createAccount: (data: CreateAccountInput) => Promise<Account>;
  updateAccount: (id: string, data: Partial<CreateAccountInput>) => Promise<void>;
  reset: () => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountsApi.list();
      set({ accounts, isLoading: false });
    } catch {
      set({ error: 'Erreur lors du chargement des comptes', isLoading: false });
    }
  },

  createAccount: async (data) => {
    const account = await accountsApi.create(data);
    set((state) => ({ accounts: [account, ...state.accounts] }));
    return account;
  },

  updateAccount: async (id, data) => {
    const updated = await accountsApi.update(id, data);
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? updated : a)),
    }));
  },

  reset: () => set({ accounts: [], isLoading: false, error: null }),
}));
