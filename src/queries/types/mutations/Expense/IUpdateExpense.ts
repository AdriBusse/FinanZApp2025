export interface IUpdateExpense {
  id: string;
  title?: string;
  currency?: string;
  archived?: boolean;
}
export interface IReturn {
  id: string;
  title: string;
  currency: string;
  archived: boolean;
}
