import {gql} from '@apollo/client';

export const CREATEEXPANSETRANSACTION = gql`
  mutation CREATEEXPENSETRANSACTION(
    $expenseId: String!
    $describtion: String!
    $amount: Float!
    $categoryId: String
    $date: Float
  ) {
    createExpenseTransaction(
      expenseId: $expenseId
      describtion: $describtion
      amount: $amount
      categoryId: $categoryId
      date: $date
    ) {
      id
      expense {
        title
      }
    }
  }
`;
