import { gql } from '@apollo/client';

export const GET_DASHBOARD_EXPENSES = gql`
  query GetDashboardExpenses {
    getExpenses(archived: false) {
      id
      title
      sum
      currency
    }
  }
`;
