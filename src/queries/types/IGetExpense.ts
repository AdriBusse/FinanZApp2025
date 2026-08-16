export interface IGetExpense {
  getExpense: IExpense;
}

interface IExpense {
  id: string;
  title: string;
  sum: number;
  currency: string;
  archived: boolean;
  createdAt: string;
  transactions: ITransactions[];
}

export interface ITransactions {
  id: string;
  describtion: string;
  amount: number;
  createdAt: string;
  currency: string;
  category: {
    id: string;
    name: string;
  };
}
