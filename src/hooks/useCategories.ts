import { useMutation, useQuery } from '@apollo/client';
import { GETEXPENSECATEGORIES } from '../queries/GetExpenseCategories';
import { DELETEEXPENSECATEGORY } from '../queries/mutations/Expenses/DeleteExpenseCategory';

  const [deleteCategoryMutation, { loading: deleting }] = useMutation(DELETEEXPENSECATEGORY);

export const useCategories = () => {
  
  const getCategories = useQuery(GETEXPENSECATEGORIES, {
    //fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const deleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation({
                    variables: { id: categoryId },
                    refetchQueries: [{ query: GETEXPENSECATEGORIES }],
                  });
  }
  return {
    getCategories,
    deleteCategory,
};
}
