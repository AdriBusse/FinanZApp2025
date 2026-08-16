import { gql } from '@apollo/client';

export const GETEXPENSES = gql`
  query GETEXPENSES {
    getExpenses(archived: false) {
      id
      title
      sum
      currency
      transactionCount
      archived
      createdAt
      monthlyRecurring
      spendingLimit
    }
  }
`;
