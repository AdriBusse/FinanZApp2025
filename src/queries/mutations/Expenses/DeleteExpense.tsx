import {gql} from '@apollo/client';

export const DELETEEXPENSE = gql`
  mutation DELETEEXPENSE($id: String!) {
    deleteExpense(id: $id)
  }
`;
