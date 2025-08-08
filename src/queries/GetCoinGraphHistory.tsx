import { gql } from '@apollo/client';

export const GETCOINGRAPHHISTORY = gql`
  query GETCOINGRAPHHISTORY(
    $id: String!
    $vs_currency: String!
    $days: Float!
  ) {
    getCoinGraphHistory(id: $id, vs_currency: $vs_currency, days: $days) {
      prices
      market_caps
      total_volumes
    }
  }
`;
