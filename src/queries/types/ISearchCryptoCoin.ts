export interface ISearchCryptoCoin {
  searchCryptoCoin: {
    id: string;
    market_cap_rank: number;
    symbol: string;
    name: string;
    thumb: string;
  }[];
}

export interface InputType {
  query: string;
}
