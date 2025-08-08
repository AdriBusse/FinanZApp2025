import {gql} from '@apollo/client';

export const GETEXPENSE = gql`
  query GETEXPENSE($id: String!) {
    getExpense(id: $id) {
      id
      title
      sum
      createdAt
      currency
      archived
      transactions {
        id
        describtion
        amount
        createdAt
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
