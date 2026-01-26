import { gql } from '@apollo/client';

export const CONFIRM_VOICE_TRANSACTION = gql`
  mutation CONFIRMVOICETRANSACTION(
    $expenseId: String!
    $title: String!
    $amount: Float!
    $categoryId: String
  ) {
    confirmVoiceTransaction(
      expenseId: $expenseId
      title: $title
      amount: $amount
      categoryId: $categoryId
    ) {
      id
      describtion
      amount
      createdAt
      category {
        id
        name
      }
    }
  }
`;
