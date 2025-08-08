export interface IUpdateExpenseTransaction {
  transactionId: string;
  amount?: number;
  describtion?: string;
  categoryId?: string;
  date?: string;
}
export interface IReturn {
  id: string;
  amount: number;
  decribtion: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
}
