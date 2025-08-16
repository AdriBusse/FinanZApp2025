import { gql } from '@apollo/client';

export const UPDATEEXPENSE = gql`
  mutation UPDATEEXPENSE(
    $id: String!
    $title: String
    $currency: String
    $archived: Boolean
    $monthlyRecurring: Boolean
    $spendingLimit: Int
  ) {
    updateExpense(
      id: $id
      title: $title
      currency: $currency
      archived: $archived
      monthlyRecurring: $monthlyRecurring
      spendingLimit: $spendingLimit
    ) {
      id
      title
      currency
      archived
      monthlyRecurring
      spendingLimit
    }
  }
`;
