import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GETDEPOTS } from '../queries/GetDepots';
import { GETDEPOT } from '../queries/GetDepot';
import { CREATESAVINGDEPOT } from '../queries/mutations/Savings/CreateSavingDepot';
import { CREATESAVINGTRANSACTION } from '../queries/mutations/Savings/CreateSavingTransaction';
import { DELETESAVINGDEPOT } from '../queries/mutations/Savings/DeleteSavingDepot';
import { DELETESAVINGTRANSACTION } from '../queries/mutations/Savings/DeleteSavingTransaction';
import { UPDATESAVINGDEPOT } from '../queries/mutations/Savings/UpdateSavingDepot';
import { UPDATESAVINGTRANSACTION } from '../queries/mutations/Savings/UpdateSavingTransaction';

type UseSavingsOptions = {
  includeList?: boolean;
  depotId?: string;
};

export const useSavings = (options?: UseSavingsOptions) => {
  const depotsQuery = useQuery(GETDEPOTS, {
    skip: options?.includeList === false,
    notifyOnNetworkStatusChange: true,
  });

  const depotQuery = useQuery(GETDEPOT, {
    variables: { id: options?.depotId ?? '' },
    skip: !options?.depotId,
    notifyOnNetworkStatusChange: true,
  });
  const { refetch: refetchDepots } = depotsQuery;
  const { refetch: refetchDepot } = depotQuery;

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
      update: (cache, { data }) => {
        const depot = data?.createSavingDepot;
        if (!depot) return;

        cache.updateQuery({ query: GETDEPOTS }, existing => {
          if (!existing) return existing;
          return {
            ...existing,
            getSavingDepots: [
              depot,
              ...existing.getSavingDepots.filter(item => item.id !== depot.id),
            ],
          };
        });
      },
    });
  };

  const updateSavingDepot = async (
    id: string,
    name?: string,
    short?: string,
    currency?: string | null,
    savinggoal?: number | null,
  ) => {
    await updateSavingDepotMutation({
      variables: { id, name, short, currency, savinggoal },
    });
  };

  const deleteSavingDepot = async (id: string) => {
    await deleteSavingDepotMutation({
      variables: { id },
      update: cache => {
        cache.updateQuery({ query: GETDEPOTS }, existing => {
          if (!existing) return existing;
          return {
            ...existing,
            getSavingDepots: existing.getSavingDepots.filter(
              item => item.id !== id,
            ),
          };
        });
        const cacheId = cache.identify({ __typename: 'SavingDepot', id });
        if (cacheId) cache.evict({ id: cacheId });
        cache.gc();
      },
    });
  };

  const createSavingTransaction = async (
    depotId: string,
    amount: number,
    describtion: string,
  ) => {
    await createSavingTransactionMutation({
      variables: { depotId, amount, describtion },
      update: (cache, { data }) => {
        const transaction = data?.createSavingTransaction;
        if (!transaction) return;

        cache.updateQuery(
          { query: GETDEPOT, variables: { id: depotId } },
          existing => {
            if (!existing?.getSavingDepot) return existing;
            const existingTransactions =
              existing.getSavingDepot.transactions || [];
            return {
              ...existing,
              getSavingDepot: {
                ...existing.getSavingDepot,
                transactions: [
                  transaction,
                  ...existingTransactions.filter(
                    (item: any) => `${item.id}` !== `${transaction.id}`,
                  ),
                ],
              },
            };
          },
        );
        const cacheId = cache.identify({
          __typename: 'SavingDepot',
          id: depotId,
        });
        if (!cacheId) return;
        cache.modify({
          id: cacheId,
          fields: {
            sum: existing => Number(existing ?? 0) + Number(transaction.amount),
          },
        });
      },
    });
  };

  const updateSavingTransaction = async (
    transactionId: string,
    depotId: string,
    amount?: number,
    describtion?: string,
    date?: string | number,
  ) => {
    const formattedDate =
      typeof date === 'number'
        ? new Date(date).toISOString()
        : date
        ? new Date(date).toISOString()
        : undefined;

    await updateSavingTransactionMutation({
      variables: {
        id: Number(transactionId),
        amount,
        describtion,
        date: formattedDate,
      },
      update: (cache, { data }) => {
        const transaction = data?.updateSavingTransaction;
        if (!transaction) return;

        let previousAmount: number | undefined;
        cache.updateQuery(
          { query: GETDEPOT, variables: { id: depotId } },
          existing => {
            if (!existing?.getSavingDepot) return existing;
            const existingTransactions =
              existing.getSavingDepot.transactions || [];
            const transactions = existingTransactions.map((item: any) => {
              if (`${item.id}` !== `${transaction.id}`) return item;
              previousAmount = Number(item.amount);
              return { ...item, ...transaction };
            });
            return {
              ...existing,
              getSavingDepot: { ...existing.getSavingDepot, transactions },
            };
          },
        );
        if (previousAmount === undefined) return;
        const cacheId = cache.identify({
          __typename: 'SavingDepot',
          id: depotId,
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

  const deleteSavingTransaction = async (
    transactionId: string,
    depotId: string,
  ) => {
    await deleteSavingTransactionMutation({
      variables: { id: transactionId },
      update: cache => {
        let deletedAmount: number | undefined;
        cache.updateQuery(
          { query: GETDEPOT, variables: { id: depotId } },
          existing => {
            if (!existing?.getSavingDepot) return existing;
            const existingTransactions =
              existing.getSavingDepot.transactions || [];
            const transactions = existingTransactions.filter((item: any) => {
              if (`${item.id}` === `${transactionId}`)
                deletedAmount = Number(item.amount);
              return `${item.id}` !== `${transactionId}`;
            });
            return {
              ...existing,
              getSavingDepot: { ...existing.getSavingDepot, transactions },
            };
          },
        );
        const cacheId = cache.identify({
          __typename: 'SavingDepot',
          id: depotId,
        });
        if (cacheId && deletedAmount !== undefined) {
          cache.modify({
            id: cacheId,
            fields: {
              sum: existing => Number(existing ?? 0) - deletedAmount!,
            },
          });
        }
        const transactionCacheId = cache.identify({
          __typename: 'SavingTransaction',
          id: transactionId,
        });
        if (transactionCacheId) cache.evict({ id: transactionCacheId });
      },
    });
  };

  const refetchAll = useCallback(async () => {
    const promises = [];
    if (options?.includeList !== false) {
      promises.push(refetchDepots());
    }
    if (options?.depotId) {
      promises.push(refetchDepot());
    }
    await Promise.all(promises);
  }, [options?.depotId, options?.includeList, refetchDepot, refetchDepots]);

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
