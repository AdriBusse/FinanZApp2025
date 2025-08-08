export interface IGetETFs {
  getETFs: IETF[];
}

export interface IETF {
  id: string;
  name: string;
  title: string;
  symbol: string;
  isin: string;
  wkn: string;
  deposited: number;
  worth: number;
  amount: number;
}
