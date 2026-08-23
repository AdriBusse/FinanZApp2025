import { gql } from '@apollo/client';
export const UPDATESAVINGTRANSACTION = gql`
  mutation UPDATESAVINGTransaction(
    $id: Int!
    $describtion: String
    $amount: Float
    $date: String
  ) {
    updateSavingTransaction(
      transactionId: $id
      describtion: $describtion
      amount: $amount
      date: $date
    ) {
      id
      describtion
      amount
      createdAt
    }
  }
`;
