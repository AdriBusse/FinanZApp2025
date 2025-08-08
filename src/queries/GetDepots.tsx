import {gql} from '@apollo/client';

export const GETDEPOTS = gql`
  query GetSavingDepots {
    getSavingDepots {
      name
      id
      sum
    }
  }
`;
