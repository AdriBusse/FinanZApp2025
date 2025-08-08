export interface IGetETFDetails {
  getETF: {
    id: string;
    name: string;
    title: string;
    isin: string;
    wkn: string;
    deposited: number;
    worth: number;
    amount: number;
    transactions: Array<Transaction>;
  };
}

export interface Transaction {
  id: string;
  invest: number;
  fee: number;
  amount: number;
  value: number;
  createdAt: string;
}
