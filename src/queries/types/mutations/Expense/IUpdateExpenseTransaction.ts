export interface IUpdateExpenseTransaction {
  id: string;
  amount?: number;
  describtion?: string;
  categoryId?: string;
  date?: string;
}
export interface IReturn {
  id: string;
  amount: number;
  describtion: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}
