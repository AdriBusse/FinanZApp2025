import { gql } from '@apollo/client';

export const GETARCHIVEDEXPENSES = gql`
  query GETARCHIVEDEXPENSES {
    getExpenses(archived: true) {
      id
      title
      sum
      currency
    }
  }
`;
