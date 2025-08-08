import {gql} from '@apollo/client';

export const DELETEEXPENSETRANSACTION = gql`
  mutation DELETEEXPANSETRANSACTION($id: String!) {
    deleteExpenseTransaction(id: $id)
  }
`;
