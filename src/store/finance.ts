import create from 'zustand';
import { apolloClient } from '../apollo/client';
import {
  SUMMARY_QUERY,
  GET_SAVING_DEPOTS_QUERY,
  GET_EXPENSES_QUERY,
  CREATE_EXPENSE_TRANSACTION,
  CREATE_SAVING_TRANSACTION,
  CREATE_SAVING_DEPOT,
  DELETE_EXPENSE_TRANSACTION,
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
  bootstrapped: boolean;
  summary: UserSummary | null;
  depots: SavingDepot[];
  expenses: Expense[];
  loadAll: () => Promise<void>;
  createExpenseTx: (
    expenseId: string,
    amount: number,
    describtion: string,
    categoryId?: string,
    dateMs?: number | null,
    autocategorize?: boolean,
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
  deleteExpenseTransaction: (expenseId: string, id: string) => Promise<void>;
  deleteSavingTransaction: (id: string) => Promise<void>;
  deleteSavingDepot: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  isLoading: false,
  bootstrapped: false,
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
      set({ isLoading: false, bootstrapped: true });
    }
  },
  deleteExpenseTransaction: async (expenseId, id) => {
    // If this is a temp ID, just remove locally and from cache; no server call
    const isTemp = id.startsWith('temp-');
    let prevExpensesSnapshot: any[] | null = null;
    try {
      const st = get();
      prevExpensesSnapshot = st.expenses ? [...(st.expenses as any[])] : null;
      let removedAmount = 0;
      const updatedExpenses = (st.expenses || []).map(e => {
        if (e.id !== expenseId) return e as any;
        const txs = Array.isArray(e.transactions) ? e.transactions : [];
        const found = txs.find((t: any) => t.id === id);
        removedAmount = found?.amount || 0;
        return {
          ...e,
          transactions: txs.filter((t: any) => t.id !== id),
          sum: (e.sum || 0) - removedAmount,
        } as any;
      });
      set({ expenses: updatedExpenses as any });
    } catch {}

    // Update Apollo cache to reflect deletion optimistically
    try {
      const existing: any = apolloClient.readQuery({ query: GET_EXPENSES_QUERY });
      if (existing?.getExpenses) {
        let removedAmountC = 0;
        const updated = existing.getExpenses.map((e: any) => {
          if (e.id !== expenseId) return e;
          const txs = Array.isArray(e.transactions) ? e.transactions : [];
          const found = txs.find((t: any) => t.id === id);
          removedAmountC = found?.amount || 0;
          return {
            ...e,
            transactions: txs.filter((t: any) => t.id !== id),
            sum: (e.sum || 0) - removedAmountC,
          };
        });
        apolloClient.writeQuery({ query: GET_EXPENSES_QUERY, data: { getExpenses: updated } });
      }
    } catch {}

    if (isTemp) {
      // Nothing to do on server for temp items
      return;
    }

    try {
      await apolloClient.mutate({
        mutation: DELETE_EXPENSE_TRANSACTION,
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteExpenseTransaction: true,
        },
        update: cache => {
          try {
            const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
            if (existing?.getExpenses) {
              let removedAmountC = 0;
              const updated = existing.getExpenses.map((e: any) => {
                if (e.id !== expenseId) return e;
                const txs = Array.isArray(e.transactions) ? e.transactions : [];
                const found = txs.find((t: any) => t.id === id);
                removedAmountC = found?.amount || 0;
                return {
                  ...e,
                  transactions: txs.filter((t: any) => t.id !== id),
                  sum: (e.sum || 0) - removedAmountC,
                };
              });
              cache.writeQuery({ query: GET_EXPENSES_QUERY, data: { getExpenses: updated } });
            }
          } catch {}
        },
      });
    } catch (e) {
      // rollback Zustand on error
      if (prevExpensesSnapshot) set({ expenses: prevExpensesSnapshot as any });
      throw e;
    }
  },
  createExpenseTx: async (
    expenseId,
    amount,
    describtion,
    categoryId,
    dateMs = null,
    autocategorize = false,
  ) => {
    const createdAtIso = new Date(dateMs ?? Date.now()).toISOString();
    const tempId = `temp-${Date.now()}`;

    // Optimistically update local Zustand store immediately
    let prevExpensesSnapshot: any[] | null = null;
    try {
      const st = get();
      prevExpensesSnapshot = st.expenses ? [...(st.expenses as any[])] : null;
      const updatedExpenses = (st.expenses || []).map(e => {
        if (e.id !== expenseId) return e as any;
        const tx = {
          __typename: 'ExpenseTransaction',
          id: tempId,
          amount,
          createdAt: createdAtIso,
          describtion,
          category: categoryId ? { __typename: 'ExpenseCategory', id: categoryId, name: 'Category' } : null,
        } as any;
        const txs = Array.isArray(e.transactions) ? e.transactions : [];
        return { ...e, transactions: [tx, ...txs], sum: (e.sum || 0) + amount } as any;
      });
      set({ expenses: updatedExpenses as any });
    } catch {}

    try {
      await apolloClient.mutate({
        mutation: CREATE_EXPENSE_TRANSACTION,
        variables: {
          expenseId,
          amount,
          describtion,
          categoryId,
          date: dateMs ?? undefined,
          autocategorize,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createExpenseTransaction: {
            __typename: 'ExpenseTransaction',
            id: tempId,
            amount,
            createdAt: createdAtIso,
            describtion,
            category: categoryId
              ? { __typename: 'ExpenseCategory', id: categoryId, name: 'Category' }
              : null,
          },
        },
        update: (cache, { data }) => {
          try {
            const newTx: any = data?.createExpenseTransaction;
            const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
            if (existing?.getExpenses) {
              const updated = existing.getExpenses.map((e: any) => {
                if (e.id !== expenseId) return e;
                const txs = Array.isArray(e.transactions) ? [...e.transactions] : [];
                const withoutDup = txs.filter((t: any) => t.id !== newTx?.id);
                return {
                  ...e,
                  transactions: [newTx, ...withoutDup],
                  sum: (e.sum || 0) + (newTx?.amount || 0),
                };
              });
              cache.writeQuery({ query: GET_EXPENSES_QUERY, data: { getExpenses: updated } });
            }
          } catch {}

          // Reconcile temp ID in Zustand state (no sum change)
          try {
            const st = get();
            const next = (st.expenses || []).map(e => {
              if (e.id !== expenseId) return e as any;
              const txs = Array.isArray(e.transactions) ? e.transactions : [];
              const replaced = txs.map((t: any) =>
                t.id === tempId ? { ...t, id: (data as any)?.createExpenseTransaction?.id } : t,
              );
              return { ...e, transactions: replaced } as any;
            });
            set({ expenses: next as any });
          } catch {}
        },
      });
    } catch (e) {
      // rollback Zustand on error
      if (prevExpensesSnapshot) set({ expenses: prevExpensesSnapshot as any });
      throw e;
    }
  },
  createSavingTx: async (depotId, amount, describtion) => {
    const createdAtIso = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;

    // Optimistically update Zustand store first for immediate UI
    let prevDepotsSnapshot: any[] | null = null;
    try {
      const st = get();
      prevDepotsSnapshot = st.depots ? [...(st.depots as any[])] : null;
      const updatedDepots = (st.depots || []).map(d => {
        if (d.id !== depotId) return d as any;
        const tx = {
          __typename: 'SavingTransaction',
          id: tempId,
          amount,
          createdAt: createdAtIso,
          describtion,
        } as any;
        const txs = Array.isArray(d.transactions) ? d.transactions : [];
        return { ...d, transactions: [tx, ...txs], sum: (d.sum || 0) + amount } as any;
      });
      set({ depots: updatedDepots as any });
    } catch {}

    try {
      await apolloClient.mutate({
        mutation: CREATE_SAVING_TRANSACTION,
        variables: { depotId, amount, describtion },
        optimisticResponse: {
          __typename: 'Mutation',
          createSavingTransaction: {
            __typename: 'SavingTransaction',
            id: tempId,
            amount,
            createdAt: createdAtIso,
            describtion,
          },
        },
        update: (cache, { data }) => {
          try {
            const newTx: any = data?.createSavingTransaction;
            const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
            if (existing?.getSavingDepots) {
              const updated = existing.getSavingDepots.map((d: any) => {
                if (d.id !== depotId) return d;
                const txs = Array.isArray(d.transactions) ? [...d.transactions] : [];
                const withoutDup = txs.filter((t: any) => t.id !== newTx?.id);
                return {
                  ...d,
                  transactions: [newTx, ...withoutDup],
                  sum: (d.sum || 0) + (newTx?.amount || 0),
                };
              });
              cache.writeQuery({ query: GET_SAVING_DEPOTS_QUERY, data: { getSavingDepots: updated } });
            }
          } catch {}

          // Reconcile temp ID in Zustand state (no sum change)
          try {
            const st = get();
            const next = (st.depots || []).map(d => {
              if (d.id !== depotId) return d as any;
              const txs = Array.isArray(d.transactions) ? d.transactions : [];
              const replaced = txs.map((t: any) =>
                t.id === tempId ? { ...t, id: (data as any)?.createSavingTransaction?.id } : t,
              );
              return { ...d, transactions: replaced } as any;
            });
            set({ depots: next as any });
          } catch {}
        },
      });
    } catch (e) {
      if (prevDepotsSnapshot) set({ depots: prevDepotsSnapshot as any });
      throw e;
    }
  },
  createSavingDepot: async (
    name,
    short,
    currency = null,
    savinggoal = null,
  ) => {
    const tempId = `temp-${Date.now()}`;

    // Optimistically update Zustand store first
    let prevDepotsSnapshot: any[] | null = null;
    try {
      const st = get();
      prevDepotsSnapshot = st.depots ? [...(st.depots as any[])] : null;
      const newDepot: any = {
        __typename: 'SavingDepot',
        id: tempId,
        name,
        short,
        currency,
        savinggoal,
        sum: 0,
        transactions: [],
      };
      set({ depots: [newDepot, ...(st.depots || [])] as any });
    } catch {}

    try {
      await apolloClient.mutate({
        mutation: CREATE_SAVING_DEPOT,
        variables: { name, short, currency, savinggoal },
        optimisticResponse: {
          __typename: 'Mutation',
          createSavingDepot: {
            __typename: 'SavingDepot',
            id: tempId,
            name,
            short,
            currency,
            savinggoal,
            sum: 0,
          },
        },
        update: (cache, { data }) => {
          try {
            const newDepot: any = data?.createSavingDepot;
            const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
            const list = existing?.getSavingDepots || [];
            const withoutDup = list.filter((d: any) => d.id !== newDepot?.id);
            cache.writeQuery({
              query: GET_SAVING_DEPOTS_QUERY,
              data: { getSavingDepots: [newDepot, ...withoutDup] },
            });
          } catch {}

          // Reconcile temp ID in Zustand state (preserve current sum/transactions)
          try {
            const st = get();
            const next = (st.depots || []).map(d => {
              if (d.id !== tempId) return d as any;
              const srv: any = (data as any)?.createSavingDepot;
              return { ...d, id: srv?.id, name: srv?.name, short: srv?.short, currency: srv?.currency, savinggoal: srv?.savinggoal } as any;
            });
            set({ depots: next as any });
          } catch {}
        },
      });
    } catch (e) {
      if (prevDepotsSnapshot) set({ depots: prevDepotsSnapshot as any });
      throw e;
    }
  },
  deleteSavingTransaction: async id => {
    // Optimistically remove from Zustand store and adjust sum
    let prevDepotsSnapshot: any[] | null = null;
    try {
      const st = get();
      prevDepotsSnapshot = st.depots ? [...(st.depots as any[])] : null;
      let removedAmount = 0;
      const updatedDepots = (st.depots || []).map(d => {
        const txs = Array.isArray(d.transactions) ? d.transactions : [];
        const found = txs.find((t: any) => t.id === id);
        if (!found) return d as any;
        removedAmount = found.amount || 0;
        return {
          ...d,
          transactions: txs.filter((t: any) => t.id !== id),
          sum: (d.sum || 0) - removedAmount,
        } as any;
      });
      set({ depots: updatedDepots as any });
    } catch {}

    try {
      await apolloClient.mutate({
        mutation: DELETE_SAVING_TRANSACTION,
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteSavingTransaction: true,
        },
        update: cache => {
          try {
            const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
            if (existing?.getSavingDepots) {
              let removedAmount = 0;
              const updated = existing.getSavingDepots.map((d: any) => {
                const txs = Array.isArray(d.transactions) ? d.transactions : [];
                const found = txs.find((t: any) => t.id === id);
                if (!found) return d;
                removedAmount = found.amount || 0;
                return {
                  ...d,
                  transactions: txs.filter((t: any) => t.id !== id),
                  sum: (d.sum || 0) - removedAmount,
                };
              });
              cache.writeQuery({ query: GET_SAVING_DEPOTS_QUERY, data: { getSavingDepots: updated } });
            }
          } catch {}
        },
      });
    } catch (e) {
      if (prevDepotsSnapshot) set({ depots: prevDepotsSnapshot as any });
      throw e;
    }
  },
  deleteSavingDepot: async id => {
    // Optimistically remove depot from Zustand store
    let prevDepotsSnapshot: any[] | null = null;
    try {
      const st = get();
      prevDepotsSnapshot = st.depots ? [...(st.depots as any[])] : null;
      set({ depots: (st.depots || []).filter(d => d.id !== id) as any });
    } catch {}

    try {
      await apolloClient.mutate({
        mutation: DELETE_SAVING_DEPOT,
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteSavingDepot: true,
        },
        update: cache => {
          try {
            const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
            const list = existing?.getSavingDepots || [];
            cache.writeQuery({
              query: GET_SAVING_DEPOTS_QUERY,
              data: { getSavingDepots: list.filter((d: any) => d.id !== id) },
            });
          } catch {}
        },
      });
    } catch (e) {
      if (prevDepotsSnapshot) set({ depots: prevDepotsSnapshot as any });
      throw e;
    }
  },
}));
