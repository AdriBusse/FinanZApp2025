import { gql } from '@apollo/client';

export const DELETE_EXPENSE_TEMPLATE = gql`
  mutation DELETE_EXPENSE_TEMPLATE($id: String!) {
    deleteExpenseTransactionTemplate(id: $id)
  }
`;
