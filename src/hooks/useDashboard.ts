import { useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { SUMMARY_QUERY } from '../queries/Summary';
import { GETDEPOTS } from '../queries/GetDepots';
import { GET_DASHBOARD_EXPENSES } from '../queries/GetDashboardExpenses';

export const useDashboard = () => {
  const summaryQuery = useQuery(SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const depotsQuery = useQuery(GETDEPOTS, {
    notifyOnNetworkStatusChange: true,
  });
  const expensesQuery = useQuery(GET_DASHBOARD_EXPENSES, {
    notifyOnNetworkStatusChange: true,
  });
  const { refetch: refetchSummary } = summaryQuery;
  const { refetch: refetchDepots } = depotsQuery;
  const { refetch: refetchExpenses } = expensesQuery;

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchSummary(), refetchDepots(), refetchExpenses()]);
  }, [refetchDepots, refetchExpenses, refetchSummary]);

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
