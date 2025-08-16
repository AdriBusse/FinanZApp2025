import { gql } from '@apollo/client';

export const CREATESAVINGDEPOT = gql`
  mutation createSavingDepot(
    $name: String!
    $short: String!
    $currency: String
    $savinggoal: Int
  ) {
    createSavingDepot(
      name: $name
      short: $short
      currency: $currency
      savinggoal: $savinggoal
    ) {
      id
      name
      short
      currency
      savinggoal
    }
  }
`;
