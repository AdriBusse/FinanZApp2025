import {gql} from '@apollo/client';

export const DELETEETFTRANSACTION = gql`
  mutation deleteETFTransaction($id: String!) {
    deleteETFTransaction(id: $id)
  }
`;
