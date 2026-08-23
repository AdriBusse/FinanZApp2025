import { gql } from '@apollo/client';

export const CREATEEXPANSETRANSACTION = gql`
  mutation CREATEEXPENSETRANSACTION(
    $expenseId: String!
    $describtion: String!
    $amount: Float!
    $categoryId: String
    $date: DateTime
  ) {
    createExpenseTransaction(
      expenseId: $expenseId
      describtion: $describtion
      amount: $amount
      categoryId: $categoryId
      date: $date
    ) {
      id
      amount
      createdAt
      describtion
      category {
        id
        name
      }
    }
  }
`;
