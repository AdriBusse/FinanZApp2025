import { gql } from '@apollo/client';

export const GET_EXPENSE_TEMPLATES = gql`
  query GET_EXPENSE_TEMPLATES {
    getExpenseTransactionTemplates {
      id
      describtion
      amount
      category {
        id
        name
        icon
        color
      }
    }
  }
`;
