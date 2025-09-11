import { useQuery } from '@apollo/client';
import { GETEXPENSECATEGORIES } from '../queries/GetExpenseCategories';

export const useCategories = () => {
  return useQuery(GETEXPENSECATEGORIES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
};