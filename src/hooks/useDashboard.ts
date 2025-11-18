import { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { SUMMARY_QUERY } from '../queries/Summary';
import { GETDEPOTS } from '../queries/GetDepots';
import { GETEXPENSES } from '../queries/GetExpenses';

export const useDashboard = () => {
  const summaryQuery = useQuery(SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const depotsQuery = useQuery(GETDEPOTS, {
    notifyOnNetworkStatusChange: true,
  });
  const expensesQuery = useQuery(GETEXPENSES, {
    notifyOnNetworkStatusChange: true,
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([
      summaryQuery.refetch(),
      depotsQuery.refetch(),
      expensesQuery.refetch(),
    ]);
  }, [
    summaryQuery.refetch,
    depotsQuery.refetch,
    expensesQuery.refetch,
  ]);

  return {
    summary: summaryQuery.data?.summary ?? null,
    depots: depotsQuery.data?.getSavingDepots ?? [],
    expenses: expensesQuery.data?.getExpenses ?? [],
    summaryQuery,
    depotsQuery,
    expensesQuery,
    loading:
      summaryQuery.loading || depotsQuery.loading || expensesQuery.loading,
    error: summaryQuery.error || depotsQuery.error || expensesQuery.error,
    refetchAll,
  };
};
