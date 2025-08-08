export interface IGetCryptoCurrencyData {
  getMarketData: CurrencyData[];
}
export interface CurrencyData {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d: {
    price: number[];
  };
}
export interface InputType {
  vs_currency: string;
  per_page: number;
  page: number;
  ids?: string;
}
