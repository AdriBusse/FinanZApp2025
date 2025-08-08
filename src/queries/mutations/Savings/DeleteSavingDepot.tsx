import {gql} from '@apollo/client';

export const DELETESAVINGDEPOT = gql`
  mutation deleteSavingDepot($id: String!) {
    deleteSavingDepot(id: $id)
  }
`;
