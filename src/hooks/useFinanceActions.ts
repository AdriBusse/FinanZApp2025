import { useMutation } from '@apollo/client';
import {
  CREATE_EXPENSE_TRANSACTION,
  DELETE_EXPENSE_TRANSACTION,
  CREATE_SAVING_TRANSACTION,
  DELETE_SAVING_TRANSACTION,
  CREATE_SAVING_DEPOT,
  DELETE_SAVING_DEPOT,
  GET_EXPENSES_QUERY,
  GET_SAVING_DEPOTS_QUERY,
} from '../graphql/finance';

export const useFinanceActions = () => {
  const [createExpenseTxMutate] = useMutation(CREATE_EXPENSE_TRANSACTION);
  const [deleteExpenseTxMutate] = useMutation(DELETE_EXPENSE_TRANSACTION);
  const [createSavingTxMutate] = useMutation(CREATE_SAVING_TRANSACTION);
  const [deleteSavingTxMutate] = useMutation(DELETE_SAVING_TRANSACTION);
  const [createSavingDepotMutate] = useMutation(CREATE_SAVING_DEPOT);
  const [deleteSavingDepotMutate] = useMutation(DELETE_SAVING_DEPOT);

  const createExpenseTransaction = async (
    expenseId: string,
    amount: number,
    describtion: string,
    categoryId?: string,
    dateMs?: number,
    autocategorize?: boolean,
  ) => {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const createdAtIso = dateMs ? new Date(dateMs).toISOString() : new Date().toISOString();
    await createExpenseTxMutate({
      variables: {
        expenseId,
        amount,
        describtion,
        categoryId,
        date: dateMs,
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
          const created: any = (data as any)?.createExpenseTransaction;
          const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
          if (!existing?.getExpenses) return;
          const updated = existing.getExpenses.map((e: any) => {
            if (e.id !== expenseId) return e;
            const txs = Array.isArray(e.transactions) ? e.transactions : [];
            // Remove temp placeholder if present
            const filtered = txs.filter((t: any) => t.id !== tempId);
            return {
              ...e,
              transactions: [...filtered, created],
              sum: (e.sum || 0) + (created?.amount || 0),
            };
          });
          cache.writeQuery({ query: GET_EXPENSES_QUERY, data: { getExpenses: updated } });
        } catch {}
      },
    });
  };

  const deleteExpenseTransaction = async (expenseId: string, transactionId: string) => {
    await deleteExpenseTxMutate({
      variables: { id: transactionId },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteExpenseTransaction: true,
      },
      update: cache => {
        try {
          const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
          if (!existing?.getExpenses) return;
          const updated = existing.getExpenses.map((e: any) => {
            if (e.id !== expenseId) return e;
            const txs = Array.isArray(e.transactions) ? e.transactions : [];
            const toDelete = txs.find((t: any) => t.id === transactionId);
            return {
              ...e,
              transactions: txs.filter((t: any) => t.id !== transactionId),
              sum: (e.sum || 0) - (toDelete?.amount || 0),
            };
          });
          cache.writeQuery({ query: GET_EXPENSES_QUERY, data: { getExpenses: updated } });
        } catch {}
      },
    });
  };

  const createSavingTransaction = async (
    depotId: string,
    amount: number,
    describtion: string,
  ) => {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const createdAtIso = new Date().toISOString();
    await createSavingTxMutate({
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
          const created: any = (data as any)?.createSavingTransaction;
          const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
          if (!existing?.getSavingDepots) return;
          const updated = existing.getSavingDepots.map((d: any) => {
            if (d.id !== depotId) return d;
            const txs = Array.isArray(d.transactions) ? d.transactions : [];
            const filtered = txs.filter((t: any) => t.id !== tempId);
            return {
              ...d,
              transactions: [...filtered, created],
              sum: (d.sum || 0) + (created?.amount || 0),
            };
          });
          cache.writeQuery({
            query: GET_SAVING_DEPOTS_QUERY,
            data: { getSavingDepots: updated },
          });
        } catch {}
      },
    });
  };

  const deleteSavingTransaction = async (transactionId: string) => {
    await deleteSavingTxMutate({
      variables: { id: transactionId },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteSavingTransaction: true,
      },
      update: cache => {
        try {
          const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
          if (!existing?.getSavingDepots) return;
          const updated = existing.getSavingDepots.map((d: any) => {
            const txs = Array.isArray(d.transactions) ? d.transactions : [];
            const toDelete = txs.find((t: any) => t.id === transactionId);
            if (!toDelete) return d;
            return {
              ...d,
              transactions: txs.filter((t: any) => t.id !== transactionId),
              sum: (d.sum || 0) - (toDelete?.amount || 0),
            };
          });
          cache.writeQuery({
            query: GET_SAVING_DEPOTS_QUERY,
            data: { getSavingDepots: updated },
          });
        } catch {}
      },
    });
  };

  const createSavingDepot = async (
    name: string,
    short: string,
    currency?: string | null,
    savinggoal?: number | null,
  ) => {
    await createSavingDepotMutate({
      variables: { name, short, currency, savinggoal },
      optimisticResponse: {
        __typename: 'Mutation',
        createSavingDepot: {
          __typename: 'SavingDepot',
          id: `temp-${Math.random().toString(36).slice(2)}`,
          name,
          short,
          currency,
          savinggoal,
          sum: 0,
          transactions: [],
        },
      },
      update: (cache, { data }) => {
        try {
          const created: any = (data as any)?.createSavingDepot;
          const existing: any = cache.readQuery({ query: GET_SAVING_DEPOTS_QUERY });
          const list = existing?.getSavingDepots || [];
          cache.writeQuery({
            query: GET_SAVING_DEPOTS_QUERY,
            data: { getSavingDepots: [created, ...list] },
          });
        } catch {}
      },
    });
  };

  const deleteSavingDepot = async (depotId: string) => {
    await deleteSavingDepotMutate({
      variables: { id: depotId },
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
            data: { getSavingDepots: list.filter((d: any) => d.id !== depotId) },
          });
        } catch {}
      },
    });
  };

  return {
    createExpenseTransaction,
    deleteExpenseTransaction,
    createSavingTransaction,
    deleteSavingTransaction,
    createSavingDepot,
    deleteSavingDepot,
  };
};

