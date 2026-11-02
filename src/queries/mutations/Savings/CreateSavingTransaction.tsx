import { gql } from '@apollo/client';

export const CREATESAVINGTRANSACTION = gql`
  mutation createSavingTransaction(
    $describtion: String!
    $amount: Float!
    $depotId: String!
    $parentTransactionId: String
  ) {
    createSavingTransaction(
      describtion: $describtion
      amount: $amount
      depotId: $depotId
      parentTransactionId: $parentTransactionId
    ) {
      id
      describtion
      amount
      parentTransactionId
      createdAt
    }
  }
`;
