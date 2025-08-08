import {gql} from '@apollo/client';

export const CREATESAVINGTRANSACTION = gql`
  mutation createSavingTransaction(
    $describtion: String!
    $amount: Float!
    $depotId: String!
  ) {
    createSavingTransaction(
      describtion: $describtion
      amount: $amount
      depotId: $depotId
    ) {
      id
    }
  }
`;
