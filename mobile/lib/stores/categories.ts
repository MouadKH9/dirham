import { create } from 'zustand';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, CreateCategoryInput } from '@/lib/types';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryInput) => Promise<Category>;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.list();
      set({ categories, isLoading: false });
    } catch {
      set({ error: 'Erreur lors du chargement des catégories', isLoading: false });
    }
  },

  createCategory: async (data) => {
    const category = await categoriesApi.create(data);
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  },

  reset: () => set({ categories: [], isLoading: false, error: null }),
}));
