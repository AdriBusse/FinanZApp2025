import { gql } from '@apollo/client';

export const GETEXPENSES = gql`
  query GETEXPENSES {
    getExpenses(archived: false) {
      id
      title
      sum
      currency
    }
  }
`;
