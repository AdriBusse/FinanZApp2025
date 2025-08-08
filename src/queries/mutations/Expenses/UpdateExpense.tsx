import {gql} from '@apollo/client';

export const UPDATEEXPENSE = gql`
  mutation UPDATEEXPENSE(
    $id: String!
    $title: String
    $currency: String
    $archived: Boolean
  ) {
    updateExpense(
      id: $id
      title: $title
      currency: $currency
      archived: $archived
    ) {
      id
      title
      currency
      archived
    }
  }
`;
