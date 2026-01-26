import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GETDEPOTS } from '../queries/GetDepots';
import { GETDEPOT } from '../queries/GetDepot';
import { CREATESAVINGDEPOT } from '../queries/mutations/Savings/CreateSavingDepot';
import { CREATESAVINGTRANSACTION } from '../queries/mutations/Savings/CreateSavingTransaction';
import { DELETESAVINGDEPOT } from '../queries/mutations/Savings/DeleteSavingDepot';
import { DELETESAVINGTRANSACTION } from '../queries/mutations/Savings/DeleteSavingTransaction';
import { UPDATESAVINGDEPOT } from '../queries/mutations/Savings/UpdateSavingDepot';
import { UPDATESAVINGTRANSACTION } from '../queries/mutations/Savings/UpdateSavingTransaction';

type UseSavingsOptions = {
  depotId?: string;
};

export const useSavings = (options?: UseSavingsOptions) => {
  const depotsQuery = useQuery(GETDEPOTS, {
    notifyOnNetworkStatusChange: true,
  });

  const depotQuery = useQuery(GETDEPOT, {
    variables: { id: options?.depotId ?? '' },
    skip: !options?.depotId,
    notifyOnNetworkStatusChange: true,
  });

  const [createSavingDepotMutation] = useMutation(CREATESAVINGDEPOT);
  const [updateSavingDepotMutation] = useMutation(UPDATESAVINGDEPOT);
  const [deleteSavingDepotMutation] = useMutation(DELETESAVINGDEPOT);

  const [createSavingTransactionMutation] = useMutation(
    CREATESAVINGTRANSACTION,
  );
  const [updateSavingTransactionMutation] = useMutation(
    UPDATESAVINGTRANSACTION,
  );
  const [deleteSavingTransactionMutation] = useMutation(
    DELETESAVINGTRANSACTION,
  );

  const createSavingDepot = async (
    name: string,
    short: string,
    currency?: string | null,
    savinggoal?: number | null,
  ) => {
    await createSavingDepotMutation({
      variables: { name, short, currency, savinggoal },
      refetchQueries: [{ query: GETDEPOTS }],
      awaitRefetchQueries: true,
    });
  };

  const updateSavingDepot = async (
    id: string,
    name?: string,
    short?: string,
    currency?: string | null,
    savinggoal?: number | null,
  ) => {
    const depotRefetch = options?.depotId
      ? [{ query: GETDEPOT, variables: { id: options.depotId } }]
      : [];
    await updateSavingDepotMutation({
      variables: { id, name, short, currency, savinggoal },
      refetchQueries: [{ query: GETDEPOTS }, ...depotRefetch],
      awaitRefetchQueries: true,
    });
  };

  const deleteSavingDepot = async (id: string) => {
    await deleteSavingDepotMutation({
      variables: { id },
      refetchQueries: [{ query: GETDEPOTS }],
      awaitRefetchQueries: true,
    });
  };

  const createSavingTransaction = async (
    depotId: string,
    amount: number,
    describtion: string,
  ) => {
    await createSavingTransactionMutation({
      variables: { depotId, amount, describtion },
      refetchQueries: [
        { query: GETDEPOTS },
        { query: GETDEPOT, variables: { id: depotId } },
      ],
      awaitRefetchQueries: true,
    });
  };

  const updateSavingTransaction = async (
    transactionId: string,
    depotId: string,
    amount?: number,
    describtion?: string,
    date?: string,
  ) => {
    await updateSavingTransactionMutation({
      variables: {
        id: Number(transactionId),
        amount,
        describtion,
        date,
      },
      refetchQueries: [
        { query: GETDEPOTS },
        { query: GETDEPOT, variables: { id: depotId } },
      ],
      awaitRefetchQueries: true,
    });
  };

  const deleteSavingTransaction = async (
    transactionId: string,
    depotId: string,
  ) => {
    await deleteSavingTransactionMutation({
      variables: { id: transactionId },
      refetchQueries: [
        { query: GETDEPOTS },
        { query: GETDEPOT, variables: { id: depotId } },
      ],
      awaitRefetchQueries: true,
    });
  };

  const refetchAll = useCallback(async () => {
    const promises = [depotsQuery.refetch()];
    if (options?.depotId) {
      promises.push(depotQuery.refetch());
    }
    await Promise.all(promises);
  }, [depotsQuery.refetch, depotQuery.refetch, options?.depotId]);

  return {
    depotsQuery,
    depotQuery,
    createSavingDepot,
    updateSavingDepot,
    deleteSavingDepot,
    createSavingTransaction,
    updateSavingTransaction,
    deleteSavingTransaction,
    refetchAll,
  };
};
