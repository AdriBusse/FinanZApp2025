export interface ISearchETF {
  searchETF: ISearchETFType;
}

export interface ISearchETFType {
  name: string;
  title: string;
  symbol: string;
  isin: string;
  wkn: string;
}
