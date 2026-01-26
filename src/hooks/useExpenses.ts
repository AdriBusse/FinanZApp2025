import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
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
  expenseId?: string;
  includeArchived?: boolean;
  includeCategories?: boolean;
  includeTemplates?: boolean;
  includeCategoryMetadata?: boolean;
};

export const useExpenses = (options?: UseExpensesOptions) => {
  const expensesQuery = useQuery(GETEXPENSES, {
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
      variables: { title, currency, monthlyRecurring, spendingLimit, skipTemplateIds },
      refetchQueries: [{ query: GETEXPENSES }, { query: GETARCHIVEDEXPENSES }],
      awaitRefetchQueries: true,
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
    const expenseRefetch = options?.expenseId
      ? [{ query: GETEXPENSE, variables: { id: options.expenseId } }]
      : [];
    await updateExpenseMutation({
      variables: { id, title, currency, archived, monthlyRecurring, spendingLimit },
      refetchQueries: [
        { query: GETEXPENSES },
        { query: GETARCHIVEDEXPENSES },
        ...expenseRefetch,
      ],
      awaitRefetchQueries: true,
    });
  };

  const deleteExpense = async (id: string) => {
    await deleteExpenseMutation({
      variables: { id },
      refetchQueries: [{ query: GETEXPENSES }, { query: GETARCHIVEDEXPENSES }],
      awaitRefetchQueries: true,
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
      refetchQueries: [
        { query: GETEXPENSES },
        { query: GETEXPENSE, variables: { id: expenseId } },
      ],
      awaitRefetchQueries: true,
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
      refetchQueries: [
        { query: GETEXPENSES },
        { query: GETEXPENSE, variables: { id: expenseId } },
      ],
      awaitRefetchQueries: true,
    });
  };

  const deleteExpenseTransaction = async (
    transactionId: string,
    expenseId: string,
  ) => {
    console.log("delete ", transactionId);
    
    await deleteExpenseTransactionMutation({
      variables: { id: transactionId },
      refetchQueries: [
        { query: GETEXPENSES },
        { query: GETEXPENSE, variables: { id: expenseId } },
      ],
      awaitRefetchQueries: true,
      onError: (error) => {
        console.error('Error deleting expense transaction:', error);
      }
    });
  };

  const createCategory = async (name: string, color?: string, icon?: string) => {
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
    const tasks = [expensesQuery.refetch()];
    if (options?.includeArchived) {
      tasks.push(archivedExpensesQuery.refetch());
    }
    if (options?.expenseId) {
      tasks.push(expenseQuery.refetch());
    }
    if (options?.includeCategories) {
      tasks.push(categoriesQuery.refetch());
    }
    if (options?.includeTemplates) {
      tasks.push(expenseTemplatesQuery.refetch());
    }
    if (options?.includeCategoryMetadata) {
      tasks.push(categoryMetadataQuery.refetch());
    }
    await Promise.all(tasks);
  }, [
    expensesQuery.refetch,
    archivedExpensesQuery.refetch,
    expenseQuery.refetch,
    categoriesQuery.refetch,
    expenseTemplatesQuery.refetch,
    categoryMetadataQuery.refetch,
    options?.includeArchived,
    options?.expenseId,
    options?.includeCategories,
    options?.includeTemplates,
    options?.includeCategoryMetadata,
  ]);

  const categoryMeta = useMemo(() => {
    const colorsList = categoryMetadataQuery.data?.categoryMetadata?.colors ?? [];
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
