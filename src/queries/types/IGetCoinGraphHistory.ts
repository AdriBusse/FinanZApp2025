export interface IGetCoinGraphHistory {
  getCoinGraphHistory: {
    prices: number[][];
    marketCaps: number[][];
    totalVolumes: number[][];
  };
}
export interface InputType {
  id: string;
  vs_currency: string;
  days: number;
}
