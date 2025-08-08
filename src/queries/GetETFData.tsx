import {gql} from '@apollo/client';

export const GETETFDATA = gql`
  query GetETFData {
    getETFs {
      name
      id
      worth
      deposited
    }
  }
`;
