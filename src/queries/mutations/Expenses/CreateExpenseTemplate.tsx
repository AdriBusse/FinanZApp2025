import { gql } from '@apollo/client';

export const CREATE_EXPENSE_TEMPLATE = gql`
  mutation CREATE_EXPENSE_TEMPLATE(
    $describtion: String!
    $amount: Float!
    $categoryId: String
  ) {
    createExpenseTransactionTemplate(
      describtion: $describtion
      amount: $amount
      categoryId: $categoryId
    ) {
      id
    }
  }
`;
