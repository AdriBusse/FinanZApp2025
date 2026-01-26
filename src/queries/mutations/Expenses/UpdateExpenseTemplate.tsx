import { gql } from '@apollo/client';

export const UPDATE_EXPENSE_TEMPLATE = gql`
  mutation UPDATE_EXPENSE_TEMPLATE(
    $id: String!
    $describtion: String
    $amount: Float
    $categoryId: String
  ) {
    updateExpenseTransactionTemplate(
      id: $id
      describtion: $describtion
      amount: $amount
      categoryId: $categoryId
    ) {
      id
    }
  }
`;
