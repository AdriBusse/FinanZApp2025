export interface IGetDepot {
  getSavingDepot: {
    name: string;
    id: string;
    sum: number;
    short: string;
    transactions: Array<Transactions>;
  };
}

interface Transactions {
  id: string;
  describtion: string;
  amount: number;
  createdAt: string;
}
