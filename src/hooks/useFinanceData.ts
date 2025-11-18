import { useQuery } from '@apollo/client';
import { GETDEPOTS } from '../queries/GetDepots';
import { SUMMARY_QUERY } from '../queries/Summary';
import { GETEXPENSES } from '../queries/GetExpenses';

export const useSummary = () => {
  return useQuery(SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
};

export const useSavingDepots = () => {
  return useQuery(GETDEPOTS, {
    notifyOnNetworkStatusChange: true,
  });
};

export const useExpenses = () => {
  return useQuery(GETEXPENSES, {
    notifyOnNetworkStatusChange: true,
  });
};

export const useFinanceData = () => {
  const summary = useSummary();
  const depots = useSavingDepots();
  const expenses = useExpenses();

  return {
    summary: summary.data?.summary || null,
    depots: depots.data?.getSavingDepots || [],
    expenses: expenses.data?.getExpenses || [],
    loading: summary.loading || depots.loading || expenses.loading,
    error: summary.error || depots.error || expenses.error,
    refetch: () => {
      summary.refetch();
      depots.refetch();
      expenses.refetch();
    },
  };
};
