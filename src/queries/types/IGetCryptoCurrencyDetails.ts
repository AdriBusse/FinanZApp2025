export interface IGetCryptoCurrencyDetails {
  getCoinDetails: {
    id: string;
    symbol: string;
    name: string;
    block_time_in_minutes: number;
    hashing_algorithm: string | null;
    categories: string[];
    description: {
      en: string;
    };
    image: {
      thumb: string;
      small: string;
      large: string;
    };
    genesis_date: string | null;
    market_cap_rank: number | null;
    market_data: {
      current_price: number;
      market_cap: number;
      total_volume: number;
      ath: number;
      ath_change_percentage: number;
      ath_date: string;
      atl: number;
      atl_change_percentage: number;
      atl_date: string;

      high_24h: number;
      low_24h: number;

      price_change_24h_in_currency: number;
      price_change_percentage_24h: number;
      price_change_percentage_7d: number;
      price_change_percentage_14d: number;
      price_change_percentage_30d: number;
      price_change_percentage_60d: number;
      price_change_percentage_200d: number;
      price_change_percentage_1y: number;

      market_cap_change_24h: number;
      market_cap_change_percentage_24h: number;

      total_supply: number | null;
      max_supply: number | null;
      circulating_supply: number;
      sparkline_7d: {
        price: number[];
      };
      last_updated: string;
    };
  };
}

export interface InputType {
  vs_currency: string;
  id: string;
}
