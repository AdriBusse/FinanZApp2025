import { gql } from '@apollo/client';
export const UPDATESAVINGDEPOT = gql`
  mutation UPDATESAVINGDEPOT(
    $id: String!
    $name: String
    $short: String
    $currency: String
    $savinggoal: Int
  ) {
    updateSavingDepot(
      id: $id
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
