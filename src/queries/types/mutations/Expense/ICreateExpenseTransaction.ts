export interface ICreateExpenseTransaction {
  expenseId: string;
  describtion: string;
  amount: number;
  categoryId?: string;
  date?: number;
}
export interface IReturn {
  id: string;
  expense: {
    title: string;
  };
}
