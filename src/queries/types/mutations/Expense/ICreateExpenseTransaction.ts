export interface ICreateExpenseTransaction {
  expenseId: string;
  describtion: string;
  amount: number;
  categoryId?: string;
  date?: string;
}
export interface IReturn {
  id: string;
  amount: number;
  createdAt: string;
  describtion: string;
  category?: {
    id: string;
    name: string;
  };
}
