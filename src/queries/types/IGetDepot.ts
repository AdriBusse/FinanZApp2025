export interface IGetDepot {
  getSavingDepot: {
    name: string;
    id: string;
    sum: number;
    short: string;
    currency?: string | null;
    savinggoal?: number | null;
    transactions: Array<Transactions>;
  };
}

interface Transactions {
  id: string;
  describtion: string;
  amount: number;
  createdAt: string;
}
