import {gql} from '@apollo/client';

export const DELETEEXPENSECATEGORY = gql`
  mutation DELETEEXPENSECATEGORY($id: String!) {
    deleteExpenseCategory(id: $id)
  }
`;
