import { useMutation } from '@apollo/client';

import { GETEXPENSE } from '../queries/GetExpense';
import { GETDEPOT } from '../queries/GetDepot';
import { CREATEEXPANSETRANSACTION } from '../queries/mutations/Expenses/CreateExpenseTransaction';
import { DELETEEXPENSETRANSACTION } from '../queries/mutations/Expenses/DeleteExpenseTransaction';
import { CREATESAVINGDEPOT } from '../queries/mutations/Savings/CreateSavingDepot';
import { CREATESAVINGTRANSACTION } from '../queries/mutations/Savings/CreateSavingTransaction';
import { DELETESAVINGDEPOT } from '../queries/mutations/Savings/DeleteSavingDepot';
import { DELETESAVINGTRANSACTION } from '../queries/mutations/Savings/DeleteSavingTransaction';
import { GETDEPOTS } from '../queries/GetDepots';
import { DELETEEXPENSECATEGORY } from '../queries/mutations/Expenses/DeleteExpenseCategory';
import { GETEXPENSECATEGORIES } from '../queries/GetExpenseCategories';

export const useFinanceActions = () => {
  const [createExpenseTxMutate] = useMutation(CREATEEXPANSETRANSACTION);
  const [deleteExpenseTxMutate] = useMutation(DELETEEXPENSETRANSACTION);
  const [createSavingTxMutate] = useMutation(CREATESAVINGTRANSACTION);
  const [deleteSavingTxMutate] = useMutation(DELETESAVINGTRANSACTION);
  const [createSavingDepotMutate] = useMutation(CREATESAVINGDEPOT);
  const [deleteSavingDepotMutate] = useMutation(DELETESAVINGDEPOT);
  const createExpenseTransaction = async (
    expenseId: string,
    amount: number,
    describtion: string,
    categoryId?: string,
    dateMs?: number,
    autocategorize?: boolean,
  ) => {
    await createExpenseTxMutate({
      variables: {
        expenseId,
        amount,
        describtion,
        categoryId,
        date: dateMs,
        autocategorize,
      },
      refetchQueries: [{ query: GETEXPENSE, variables: { id: expenseId } }],
    });
  };


  const deleteExpenseTransaction = async (expenseId: string, transactionId: string) => {
    await deleteExpenseTxMutate({
      variables: { id: transactionId },
      refetchQueries: [{ query: GETEXPENSE, variables: { id: expenseId } }],
    });
  };

  const createSavingTransaction = async (
    depotId: string,
    amount: number,
    describtion: string,
  ) => {
    await createSavingTxMutate({
      variables: { depotId, amount, describtion },
      refetchQueries: [{ query: GETDEPOT, variables: { id: depotId } }],

    });
  };

  const deleteSavingTransaction = async (transactionId: string, depotId: string) => {
    await deleteSavingTxMutate({
      variables: { id: transactionId },
      refetchQueries: [{ query: GETDEPOT, variables: { id: depotId } }],

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
      refetchQueries: [{ query: GETDEPOTS }],
    });
  };

  const deleteSavingDepot = async (depotId: string) => {
    await deleteSavingDepotMutate({
      variables: { id: depotId },
      refetchQueries: [{ query: GETDEPOTS }],
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

