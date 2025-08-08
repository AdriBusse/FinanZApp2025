import {gql} from '@apollo/client';
export const DELETESAVINGTRANSACTION = gql`
  mutation DeleteSavingTransaction($id: String!) {
    deleteSavingTransaction(id: $id)
  }
`;
