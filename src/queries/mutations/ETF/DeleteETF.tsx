import {gql} from '@apollo/client';

export const DELETEETF = gql`
  mutation deleteETF($id: String!) {
    deleteETF(id: $id)
  }
`;
