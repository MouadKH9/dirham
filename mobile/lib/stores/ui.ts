import { create } from 'zustand';
import type { QuickAddPresetId } from '@/lib/constants/quickAddPresets';

interface UIState {
  isAddTransactionOpen: boolean;
  addTransactionPreset: QuickAddPresetId | null;
  openAddTransaction: (preset?: QuickAddPresetId) => void;
  closeAddTransaction: () => void;
  clearAddTransactionPreset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  addTransactionPreset: null,
  openAddTransaction: (preset) => set({ isAddTransactionOpen: true, addTransactionPreset: preset ?? null }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false }),
  clearAddTransactionPreset: () => set({ addTransactionPreset: null }),
}));
