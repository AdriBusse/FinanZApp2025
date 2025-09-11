import { useQuery } from '@apollo/client';
import {
  SUMMARY_QUERY,
  GET_SAVING_DEPOTS_QUERY,
  GET_EXPENSES_QUERY,
} from '../graphql/finance';

export const useSummary = () => {
  return useQuery(SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
};

export const useSavingDepots = () => {
  return useQuery(GET_SAVING_DEPOTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
};

export const useExpenses = () => {
  return useQuery(GET_EXPENSES_QUERY, {
    fetchPolicy: 'cache-and-network',
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