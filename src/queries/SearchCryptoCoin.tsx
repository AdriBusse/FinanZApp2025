import { gql } from '@apollo/client';

export const SEARCHCRYPTOCOIN = gql`
  query SEARCHCOIN($query: String!) {
    searchCryptoCoin(query: $query) {
      id
      name
      symbol
      market_cap_rank
      thumb
    }
  }
`;
