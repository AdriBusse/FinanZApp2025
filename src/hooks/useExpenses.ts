import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GETEXPENSES } from '../queries/GetExpenses';
import { GETARCHIVEDEXPENSES } from '../queries/GetArchivedExpenses';
import { GETEXPENSE } from '../queries/GetExpense';
import { GETEXPENSECATEGORIES } from '../queries/GetExpenseCategories';
import { CATEGORY_METADATA_QUERY } from '../queries/GetCategoryMetadata';
import { CREATEEXPENSE } from '../queries/mutations/Expenses/CreateExpense';
import { UPDATEEXPENSE } from '../queries/mutations/Expenses/UpdateExpense';
import { DELETEEXPENSE } from '../queries/mutations/Expenses/DeleteExpense';
import { CREATEEXPANSETRANSACTION } from '../queries/mutations/Expenses/CreateExpenseTransaction';
import { UPDATEEXPENSETRANSACTION } from '../queries/mutations/Expenses/UpdateExpenseTransaction';
import { DELETEEXPENSETRANSACTION } from '../queries/mutations/Expenses/DeleteExpenseTransaction';
import { CREATEEXPANSECATEGORY } from '../queries/mutations/Expenses/CreateExpenseCategory';
import { UPDATEEXPENSECATEGORY } from '../queries/mutations/Expenses/UpdateExpenseCategory';
import { DELETEEXPENSECATEGORY } from '../queries/mutations/Expenses/DeleteExpenseCategory';
import { GET_EXPENSE_TEMPLATES } from '../queries/GetExpenseTransactionTemplates';
import { CREATE_EXPENSE_TEMPLATE } from '../queries/mutations/Expenses/CreateExpenseTemplate';
import { UPDATE_EXPENSE_TEMPLATE } from '../queries/mutations/Expenses/UpdateExpenseTemplate';
import { DELETE_EXPENSE_TEMPLATE } from '../queries/mutations/Expenses/DeleteExpenseTemplate';

type UseExpensesOptions = {
  includeList?: boolean;
  expenseId?: string;
  includeArchived?: boolean;
  includeCategories?: boolean;
  includeTemplates?: boolean;
  includeCategoryMetadata?: boolean;
};

export const useExpenses = (options?: UseExpensesOptions) => {
  const expensesQuery = useQuery(GETEXPENSES, {
    skip: options?.includeList === false,
    notifyOnNetworkStatusChange: true,
  });

  const archivedExpensesQuery = useQuery(GETARCHIVEDEXPENSES, {
    skip: !options?.includeArchived,
    notifyOnNetworkStatusChange: true,
  });

  const expenseQuery = useQuery(GETEXPENSE, {
    variables: { id: options?.expenseId ?? '' },
    skip: !options?.expenseId,
    notifyOnNetworkStatusChange: true,
  });

  const categoriesQuery = useQuery(GETEXPENSECATEGORIES, {
    skip: !options?.includeCategories,
    notifyOnNetworkStatusChange: true,
  });

  const categoryMetadataQuery = useQuery(CATEGORY_METADATA_QUERY, {
    skip: !options?.includeCategoryMetadata,
    notifyOnNetworkStatusChange: true,
  });

  const expenseTemplatesQuery = useQuery(GET_EXPENSE_TEMPLATES, {
    skip: !options?.includeTemplates,
    notifyOnNetworkStatusChange: true,
  });
  const { refetch: refetchExpenses } = expensesQuery;
  const { refetch: refetchArchivedExpenses } = archivedExpensesQuery;
  const { refetch: refetchExpense } = expenseQuery;
  const { refetch: refetchCategories } = categoriesQuery;
  const { refetch: refetchCategoryMetadata } = categoryMetadataQuery;
  const { refetch: refetchExpenseTemplates } = expenseTemplatesQuery;

  const [createExpenseMutation] = useMutation(CREATEEXPENSE);
  const [updateExpenseMutation] = useMutation(UPDATEEXPENSE);
  const [deleteExpenseMutation] = useMutation(DELETEEXPENSE);

  const [createExpenseTransactionMutation] = useMutation(
    CREATEEXPANSETRANSACTION,
  );
  const [updateExpenseTransactionMutation] = useMutation(
    UPDATEEXPENSETRANSACTION,
  );
  const [deleteExpenseTransactionMutation] = useMutation(
    DELETEEXPENSETRANSACTION,
  );

  const [createCategoryMutation] = useMutation(CREATEEXPANSECATEGORY);
  const [updateCategoryMutation] = useMutation(UPDATEEXPENSECATEGORY);
  const [deleteCategoryMutation] = useMutation(DELETEEXPENSECATEGORY);

  const [createTemplateMutation] = useMutation(CREATE_EXPENSE_TEMPLATE);
  const [updateTemplateMutation] = useMutation(UPDATE_EXPENSE_TEMPLATE);
  const [deleteTemplateMutation] = useMutation(DELETE_EXPENSE_TEMPLATE);

  const createExpense = async (
    title: string,
    currency?: string | null,
    monthlyRecurring?: boolean,
    spendingLimit?: number | null,
    skipTemplateIds?: string[],
  ) => {
    await createExpenseMutation({
      variables: {
        title,
        currency,
        monthlyRecurring,
        spendingLimit,
        skipTemplateIds,
      },
      update: (cache, { data }) => {
        const expense = data?.createExpense;
        if (!expense) return;

        cache.updateQuery({ query: GETEXPENSES }, existing => {
          if (!existing) return existing;
          return {
            ...existing,
            getExpenses: [
              expense,
              ...existing.getExpenses.filter(item => item.id !== expense.id),
            ],
          };
        });
      },
    });
  };

  const updateExpense = async (
    id: string,
    title?: string,
    currency?: string | null,
    archived?: boolean,
    monthlyRecurring?: boolean,
    spendingLimit?: number | null,
  ) => {
    await updateExpenseMutation({
      variables: {
        id,
        title,
        currency,
        archived,
        monthlyRecurring,
        spendingLimit,
      },
      update: (cache, { data }) => {
        const expense = data?.updateExpense;
        if (!expense) return;

        cache.updateQuery({ query: GETEXPENSES }, existing => {
          if (!existing) return existing;
          const remaining = existing.getExpenses.filter(
            item => item.id !== expense.id,
          );
          const hasExpense = remaining.length !== existing.getExpenses.length;
          return {
            ...existing,
            getExpenses: expense.archived
              ? remaining
              : hasExpense
              ? existing.getExpenses.map(item =>
                  item.id === expense.id ? expense : item,
                )
              : [expense, ...remaining],
          };
        });
        cache.updateQuery({ query: GETARCHIVEDEXPENSES }, existing => {
          if (!existing) return existing;
          const remaining = existing.getExpenses.filter(
            item => item.id !== expense.id,
          );
          const hasExpense = remaining.length !== existing.getExpenses.length;
          return {
            ...existing,
            getExpenses: expense.archived
              ? hasExpense
                ? existing.getExpenses.map(item =>
                    item.id === expense.id ? expense : item,
                  )
                : [expense, ...remaining]
              : remaining,
          };
        });
      },
    });
  };

  const deleteExpense = async (id: string) => {
    await deleteExpenseMutation({
      variables: { id },
      update: cache => {
        [GETEXPENSES, GETARCHIVEDEXPENSES].forEach(query => {
          cache.updateQuery({ query }, existing => {
            if (!existing) return existing;
            return {
              ...existing,
              getExpenses: existing.getExpenses.filter(item => item.id !== id),
            };
          });
        });
        const cacheId = cache.identify({ __typename: 'Expense', id });
        if (cacheId) cache.evict({ id: cacheId });
        cache.gc();
      },
    });
  };

  const createExpenseTransaction = async (
    expenseId: string,
    amount: number,
    describtion: string,
    categoryId?: string,
    date?: number,
    autocategorize?: boolean,
  ) => {
    await createExpenseTransactionMutation({
      variables: {
        expenseId,
        amount,
        describtion,
        categoryId,
        date,
        autocategorize,
      },
      update: (cache, { data }) => {
        const transaction = data?.createExpenseTransaction;
        if (!transaction) return;

        cache.updateQuery(
          { query: GETEXPENSE, variables: { id: expenseId } },
          existing => {
            if (!existing?.getExpense) return existing;
            return {
              ...existing,
              getExpense: {
                ...existing.getExpense,
                transactions: [
                  transaction,
                  ...existing.getExpense.transactions,
                ],
              },
            };
          },
        );
        const cacheId = cache.identify({
          __typename: 'Expense',
          id: expenseId,
        });
        if (!cacheId) return;
        cache.modify({
          id: cacheId,
          fields: {
            sum: existing => Number(existing ?? 0) + Number(transaction.amount),
            transactionCount: existing => Number(existing ?? 0) + 1,
          },
        });
      },
    });
  };

  const updateExpenseTransaction = async (
    transactionId: string,
    expenseId: string,
    amount?: number,
    describtion?: string,
    categoryId?: string | null,
    date?: string,
  ) => {
    await updateExpenseTransactionMutation({
      variables: {
        transactionId,
        amount,
        describtion,
        categoryId,
        date,
      },
      update: (cache, { data }) => {
        const transaction = data?.updateExpenseTransaction;
        if (!transaction) return;

        let previousAmount: number | undefined;
        cache.updateQuery(
          { query: GETEXPENSE, variables: { id: expenseId } },
          existing => {
            if (!existing?.getExpense) return existing;
            const transactions = existing.getExpense.transactions.map(item => {
              if (item.id !== transaction.id) return item;
              previousAmount = Number(item.amount);
              return { ...item, ...transaction };
            });
            return {
              ...existing,
              getExpense: { ...existing.getExpense, transactions },
            };
          },
        );
        if (previousAmount === undefined) return;
        const cacheId = cache.identify({
          __typename: 'Expense',
          id: expenseId,
        });
        if (!cacheId) return;
        cache.modify({
          id: cacheId,
          fields: {
            sum: existing =>
              Number(existing ?? 0) +
              Number(transaction.amount) -
              previousAmount!,
          },
        });
      },
    });
  };

  const deleteExpenseTransaction = async (
    transactionId: string,
    expenseId: string,
  ) => {
    await deleteExpenseTransactionMutation({
      variables: { id: transactionId },
      update: cache => {
        let deletedAmount: number | undefined;
        cache.updateQuery(
          { query: GETEXPENSE, variables: { id: expenseId } },
          existing => {
            if (!existing?.getExpense) return existing;
            const transactions = existing.getExpense.transactions.filter(
              item => {
                if (item.id === transactionId)
                  deletedAmount = Number(item.amount);
                return item.id !== transactionId;
              },
            );
            return {
              ...existing,
              getExpense: { ...existing.getExpense, transactions },
            };
          },
        );
        const cacheId = cache.identify({
          __typename: 'Expense',
          id: expenseId,
        });
        if (cacheId && deletedAmount !== undefined) {
          cache.modify({
            id: cacheId,
            fields: {
              sum: existing => Number(existing ?? 0) - deletedAmount!,
              transactionCount: existing =>
                Math.max(0, Number(existing ?? 0) - 1),
            },
          });
        }
        const transactionCacheId = cache.identify({
          __typename: 'ExpenseTransaction',
          id: transactionId,
        });
        if (transactionCacheId) cache.evict({ id: transactionCacheId });
      },
      onError: error => {
        console.error('Error deleting expense transaction:', error);
      },
    });
  };

  const createCategory = async (
    name: string,
    color?: string,
    icon?: string,
  ) => {
    await createCategoryMutation({
      variables: { name, color, icon },
      refetchQueries: [{ query: GETEXPENSECATEGORIES }],
      awaitRefetchQueries: true,
    });
  };

  const updateCategory = async (
    id: string,
    name?: string,
    color?: string,
    icon?: string,
  ) => {
    await updateCategoryMutation({
      variables: { id, name, color, icon },
      refetchQueries: [{ query: GETEXPENSECATEGORIES }],
      awaitRefetchQueries: true,
    });
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryMutation({
      variables: { id },
      refetchQueries: [{ query: GETEXPENSECATEGORIES }],
      awaitRefetchQueries: true,
    });
  };

  const createTemplate = async (
    describtion: string,
    amount: number,
    categoryId?: string,
  ) => {
    await createTemplateMutation({
      variables: { describtion, amount, categoryId },
      refetchQueries: [{ query: GET_EXPENSE_TEMPLATES }],
      awaitRefetchQueries: true,
    });
  };

  const updateTemplate = async (
    id: string,
    describtion?: string,
    amount?: number,
    categoryId?: string,
  ) => {
    await updateTemplateMutation({
      variables: { id, describtion, amount, categoryId },
      refetchQueries: [{ query: GET_EXPENSE_TEMPLATES }],
      awaitRefetchQueries: true,
    });
  };

  const deleteTemplate = async (id: string) => {
    await deleteTemplateMutation({
      variables: { id },
      refetchQueries: [{ query: GET_EXPENSE_TEMPLATES }],
      awaitRefetchQueries: true,
    });
  };

  const refetchAll = useCallback(async () => {
    const tasks = [];
    if (options?.includeList !== false) {
      tasks.push(refetchExpenses());
    }
    if (options?.includeArchived) {
      tasks.push(refetchArchivedExpenses());
    }
    if (options?.expenseId) {
      tasks.push(refetchExpense());
    }
    if (options?.includeCategories) {
      tasks.push(refetchCategories());
    }
    if (options?.includeTemplates) {
      tasks.push(refetchExpenseTemplates());
    }
    if (options?.includeCategoryMetadata) {
      tasks.push(refetchCategoryMetadata());
    }
    await Promise.all(tasks);
  }, [
    refetchExpenses,
    refetchArchivedExpenses,
    refetchExpense,
    refetchCategories,
    refetchExpenseTemplates,
    refetchCategoryMetadata,
    options?.includeList,
    options?.includeArchived,
    options?.expenseId,
    options?.includeCategories,
    options?.includeTemplates,
    options?.includeCategoryMetadata,
  ]);

  const categoryMeta = useMemo(() => {
    const colorsList =
      categoryMetadataQuery.data?.categoryMetadata?.colors ?? [];
    const iconsList = categoryMetadataQuery.data?.categoryMetadata?.icons ?? [];
    const colors = Array.isArray(colorsList)
      ? colorsList.map((c: any) => c?.hex).filter(Boolean)
      : [];
    const icons = Array.isArray(iconsList)
      ? iconsList
          .map((i: any) => ({
            icon: i?.icon ?? i?.keyword ?? i?.label,
            label: i?.label ?? undefined,
            keyword: i?.keyword ?? undefined,
          }))
          .filter(x => !!x.icon)
      : [];
    return { colors, icons };
  }, [categoryMetadataQuery.data]);

  return {
    expensesQuery,
    archivedExpensesQuery,
    expenseQuery,
    categoriesQuery,
    categoryMetadataQuery,
    expenseTemplatesQuery,
    createExpense,
    updateExpense,
    deleteExpense,
    createExpenseTransaction,
    updateExpenseTransaction,
    deleteExpenseTransaction,
    createCategory,
    updateCategory,
    deleteCategory,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetchAll,
    categoryMeta,
  };
};
