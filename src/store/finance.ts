import create from 'zustand';
import { apolloClient } from '../apollo/client';
import {
  SUMMARY_QUERY,
  GET_SAVING_DEPOTS_QUERY,
  GET_EXPENSES_QUERY,
  CREATE_EXPENSE_TRANSACTION,
  CREATE_SAVING_TRANSACTION,
  CREATE_SAVING_DEPOT,
  DELETE_SAVING_TRANSACTION,
  DELETE_SAVING_DEPOT,
} from '../graphql/finance';
import type {
  UserSummary,
  SavingDepot,
  Expense,
} from '../graphql/schema/schema.types';

interface FinanceState {
  isLoading: boolean;
  summary: UserSummary | null;
  depots: SavingDepot[];
  expenses: Expense[];
  loadAll: () => Promise<void>;
  createExpenseTx: (
    expenseId: string,
    amount: number,
    describtion: string,
    categoryId?: string,
  ) => Promise<void>;
  createSavingTx: (
    depotId: string,
    amount: number,
    describtion: string,
  ) => Promise<void>;
  createSavingDepot: (
    name: string,
    short: string,
    currency?: string | null,
    savinggoal?: number | null,
  ) => Promise<void>;
  deleteSavingTransaction: (id: string) => Promise<void>;
  deleteSavingDepot: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  isLoading: false,
  summary: null,
  depots: [],
  expenses: [],
  loadAll: async () => {
    set({ isLoading: true });
    try {
      const [summaryRes, depotsRes, expensesRes] = await Promise.all([
        apolloClient.query({
          query: SUMMARY_QUERY,
          fetchPolicy: 'network-only',
        }),
        apolloClient.query({
          query: GET_SAVING_DEPOTS_QUERY,
          fetchPolicy: 'network-only',
        }),
        apolloClient.query({
          query: GET_EXPENSES_QUERY,
          fetchPolicy: 'network-only',
        }),
      ]);
      set({
        summary: summaryRes.data?.summary ?? null,
        depots: depotsRes.data?.getSavingDepots ?? [],
        expenses: expensesRes.data?.getExpenses ?? [],
      });
    } finally {
      set({ isLoading: false });
    }
  },
  createExpenseTx: async (expenseId, amount, describtion, categoryId) => {
    await apolloClient.mutate({
      mutation: CREATE_EXPENSE_TRANSACTION,
      variables: {
        expenseId,
        amount,
        describtion,
        categoryId,
        autocategorize: false,
      },
    });
    await get().loadAll();
  },
  createSavingTx: async (depotId, amount, describtion) => {
    await apolloClient.mutate({
      mutation: CREATE_SAVING_TRANSACTION,
      variables: { depotId, amount, describtion },
    });
    await get().loadAll();
  },
  createSavingDepot: async (name, short, currency = null, savinggoal = null) => {
    await apolloClient.mutate({
      mutation: CREATE_SAVING_DEPOT,
      variables: { name, short, currency, savinggoal },
      refetchQueries: [{ query: GET_SAVING_DEPOTS_QUERY }],
    });
    await get().loadAll();
  },
  deleteSavingTransaction: async id => {
    await apolloClient.mutate({
      mutation: DELETE_SAVING_TRANSACTION,
      variables: { id },
    });
    await get().loadAll();
  },
  deleteSavingDepot: async id => {
    await apolloClient.mutate({
      mutation: DELETE_SAVING_DEPOT,
      variables: { id },
      refetchQueries: [{ query: GET_SAVING_DEPOTS_QUERY }],
    });
    await get().loadAll();
  },
}));
