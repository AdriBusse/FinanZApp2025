import { gql } from '@apollo/client';

export const GETEXPENSES = gql`
  query GETEXPENSES {
    getExpenses(archived: false) {
      id
      title
      sum
      currency
      archived
      monthlyRecurring
      spendingLimit
      transactions {
        id
        amount
        createdAt
        describtion
        category {
          id
          name
        }
      }
      expenseByCategory {
        name
        amount
        color
        icon
      }
    }
  }
`;
