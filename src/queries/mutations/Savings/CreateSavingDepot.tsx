import {gql} from '@apollo/client';

export const CREATESAVINGDEPOT = gql`
  mutation createSavingDepot($name: String!, $short: String!) {
    createSavingDepot(name: $name, short: $short) {
      id
    }
  }
`;
