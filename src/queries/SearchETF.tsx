import {gql} from '@apollo/client';

export const SEARCHETF = gql`
  query SEARCHETF($searchKey: String!) {
    searchETF(searchKey: $searchKey) {
      name
      title
      symbol
      isin
      wkn
    }
  }
`;
