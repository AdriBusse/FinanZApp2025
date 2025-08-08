import {gql} from '@apollo/client';

export const CREATEEXPENSE = gql`
  mutation CreateExpense($title: String!) {
    createExpense(title: $title) {
      id
    }
  }
`;
