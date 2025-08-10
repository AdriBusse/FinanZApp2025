import { gql } from '@apollo/client';

// Updated to match backend schema (see src/graphql/schema/schema.types.ts)
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

export const GET_SAVING_DEPOTS_QUERY = gql`
  query GetSavingDepots {
    getSavingDepots {
      id
      name
      short
      sum
      transactions {
        id
        amount
        createdAt
        describtion
      }
    }
  }
`;

export const GET_EXPENSES_QUERY = gql`
  query GetExpenses {
    getExpenses {
      id
      title
      currency
      archived
      sum
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

export const CREATE_EXPENSE_TRANSACTION = gql`
  mutation CreateExpenseTransaction(
    $expenseId: String!
    $amount: Float!
    $describtion: String!
    $categoryId: String
  ) {
    createExpenseTransaction(
      expenseId: $expenseId
      amount: $amount
      describtion: $describtion
      categoryId: $categoryId
    ) {
      id
      amount
      createdAt
      describtion
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_SAVING_TRANSACTION = gql`
  mutation CreateSavingTransaction(
    $depotId: String!
    $amount: Float!
    $describtion: String!
  ) {
    createSavingTransaction(
      depotId: $depotId
      amount: $amount
      describtion: $describtion
    ) {
      id
      amount
      createdAt
      describtion
    }
  }
`;

export const CREATE_SAVING_DEPOT = gql`
  mutation CreateSavingDepot($name: String!, $short: String!) {
    createSavingDepot(name: $name, short: $short) {
      id
      name
      short
      sum
    }
  }
`;

export const DELETE_SAVING_TRANSACTION = gql`
  mutation DeleteSavingTransaction($id: String!) {
    deleteSavingTransaction(id: $id)
  }
`;

export const DELETE_SAVING_DEPOT = gql`
  mutation DeleteSavingDepot($id: String!) {
    deleteSavingDepot(id: $id)
  }
`;
