import { gql } from '@apollo/client';

export const GETCRYPTOCURRENCYDATA = gql`
  query GETCRYPTOMARKETDATA(
    $per_page: Float!
    $page: Float!
    $ids: String
    $vs_currency: String
  ) {
    getMarketData(
      vs_currency: $vs_currency
      per_page: $per_page
      page: $page
      sparkline: true
      ids: $ids
    ) {
      id
      market_cap_rank
      symbol
      name
      image
      current_price
      market_cap
      total_volume
      price_change_percentage_1h_in_currency
      price_change_percentage_24h
      price_change_percentage_7d_in_currency
      sparkline_in_7d {
        price
      }
    }
  }
`;
