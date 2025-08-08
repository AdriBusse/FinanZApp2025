import { gql } from '@apollo/client';

export const SUMMARY = gql`
  query SUMMARY {
    summary {
      todaySpent {
        id
        describtion
        amount
        createdAt
        category {
          id
        }
        expense {
          id
        }
      }
      latestExpense {
        id
        title
        sum
        transactions {
          id
          describtion
          amount
        }
      }
      savingValue
      etfMovement
      etfWorth
    }
  }
`;
