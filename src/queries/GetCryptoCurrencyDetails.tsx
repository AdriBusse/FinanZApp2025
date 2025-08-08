import { gql } from '@apollo/client';

export const GETCRYPTOCURRENCYDETAILS = gql`
  query GETCOINDETAILS($id: String!, $vs_currency: String!) {
    getCoinDetails(id: $id, vs_currency: $vs_currency) {
      id
      symbol
      name
      block_time_in_minutes
      hashing_algorithm
      categories
      description {
        en
      }
      image {
        thumb
        small
        large
      }
      genesis_date
      market_cap_rank
      market_data {
        current_price
        market_cap
        total_volume
        ath
        ath_change_percentage
        ath_date
        atl
        atl_change_percentage
        atl_date

        high_24h
        low_24h

        price_change_24h_in_currency
        price_change_percentage_24h
        price_change_percentage_7d
        price_change_percentage_14d
        price_change_percentage_30d
        price_change_percentage_60d
        price_change_percentage_200d
        price_change_percentage_1y

        market_cap_change_24h
        market_cap_change_percentage_24h

        total_supply
        max_supply
        circulating_supply
        sparkline_7d {
          price
        }
        last_updated
      }
    }
  }
`;
