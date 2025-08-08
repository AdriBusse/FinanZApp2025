export interface IGetExpenses {
  getExpenses: IExpense[];
}

interface IExpense {
  id: string;
  title: string;
  sum: number;
  currency: string;
}
