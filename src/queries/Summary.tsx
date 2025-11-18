import { gql } from '@apollo/client';
export const SUMMARY_QUERY = gql`
  query Summary {
    summary {
      savingValue
      etfWorth
      etfMovement
      todaySpent {
        id
        amount
        createdAt
        describtion
      }
      latestExpense {
        id
        title
        sum
      }
    }
  }
`;