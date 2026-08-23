import { gql } from '@apollo/client';

export const UPDATEEXPENSETRANSACTION = gql`
  mutation UPDATEEXPENSETRANSACTION(
    $id: String!
    $amount: Float
    $describtion: String
    $categoryId: String
    $date: DateTime
  ) {
    updateExpenseTransaction(
      id: $id
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
