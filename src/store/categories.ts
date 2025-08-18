import { create } from 'zustand';
import { apolloClient } from '../apollo/client';
import { GETEXPENSECATEGORIES } from '../queries/GetExpenseCategories';

export interface Category {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  clearCategories: () => void;

  // Computed
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchCategories: async () => {
    const state = get();
    const now = Date.now();

    // Check if we have recent data
    if (
      state.lastFetched &&
      now - state.lastFetched < CACHE_DURATION &&
      state.categories.length > 0
    ) {
      return; // Use cached data
    }

    set({ loading: true, error: null });

    try {
      const { data } = await apolloClient.query({
        query: GETEXPENSECATEGORIES,
        fetchPolicy: 'network-only', // Force network request to get latest data
      });

      set({
        categories: data.getExpenseCategories || [],
        loading: false,
        lastFetched: now,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    }
  },

  addCategory: (category: Category) => {
    set(state => ({
      categories: [...state.categories, category],
    }));
  },

  updateCategory: (id: string, updates: Partial<Category>) => {
    set(state => ({
      categories: state.categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat,
      ),
    }));
  },

  deleteCategory: (id: string) => {
    set(state => ({
      categories: state.categories.filter(cat => cat.id !== id),
    }));
  },

  clearCategories: () => {
    set({
      categories: [],
      lastFetched: null,
    });
  },

  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },

  getCategoryByName: (name: string) => {
    return get().categories.find(
      cat => cat.name.toLowerCase() === name.toLowerCase(),
    );
  },
}));
