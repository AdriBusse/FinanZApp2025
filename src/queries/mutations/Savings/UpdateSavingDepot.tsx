import { gql } from '@apollo/client';
export const UPDATESAVINGDEPOT = gql`
  mutation UPDATESAVINGDEPOT($id: String!, $name: String, $short: String) {
    updateSavingDepot(id: $id, name: $name, short: $short) {
      id
      name
      short
    }
  }
`;
