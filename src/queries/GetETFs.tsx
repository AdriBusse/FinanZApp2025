import {gql} from '@apollo/client';

export const GETETFS = gql`
  query GETETFS {
    getETFs {
      id
      name
      title
      isin
      deposited
      worth
      amount
    }
  }
`;
