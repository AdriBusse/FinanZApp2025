import {gql} from '@apollo/client';

export const UPDATEEXPENSETRANSACTION = gql`
  mutation UPDATEEXPENSETRANSACTION(
    $transactionId: String!
    $amount: Float
    $describtion: String
    $categoryId: String
    $date: String
  ) {
    updateExpenseTransaction(
      transactionId: $transactionId
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
