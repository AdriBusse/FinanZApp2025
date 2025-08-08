export interface ISummary {
  summary: ISummaryType;
}

export interface ISummaryType {
  todaySpent: ITransaction[];
  latestExpense: IExpense;
  savingValue: number;
  etfMovement: number;
  etfWorth: number;
}
interface ITransaction {
  id: string;
  describtion: string;
  amount: number;
  createdAt: string;
  category: {
    id: string;
  };
  expense: {
    id: string;
  };
}
interface IExpenseTrans {
  id: string;
  describtion: string;
  amount: number;
}
interface IExpense {
  id: string;
  title: string;
  sum: number;
  transactions: IExpenseTrans[];
}
