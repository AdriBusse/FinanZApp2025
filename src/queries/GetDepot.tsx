import {gql} from '@apollo/client';

export const GETDEPOT = gql`
  query getSavingDepot($id: String!) {
    getSavingDepot(id: $id) {
      name
      id
      sum
      short
      transactions {
        id
        describtion
        amount
        createdAt
      }
    }
  }
`;
