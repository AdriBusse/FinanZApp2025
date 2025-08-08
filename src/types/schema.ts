// Minimal TypeScript types aligned with backend types observed in introspection
// Note: Field-level details are assumed where not specified. Adjust when endpoint is available.

export interface User {
  id: string;
  username?: string;
  email?: string;
}

export interface SavingTransaction {
  id: string;
  amount: number; // positive deposit / negative withdrawal
  createdAt?: string; // ISO
  note?: string;
}

export interface SavingDepot {
  id: string;
  name: string;
  balance?: number;
  transactions?: SavingTransaction[];
}

export interface ExpenseTransaction {
  id: string;
  amount: number; // expense amount
  createdAt?: string; // ISO
  description?: string;
  categoryId?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  topic: string; // e.g., January 2025, Vacation
  transactions?: ExpenseTransaction[];
}

export interface ExpenseByCategory {
  category: ExpenseCategory;
  total: number;
}

export interface UserSummary {
  totalSavings?: number;
  totalExpensesThisMonth?: number;
  expensesByCategory?: ExpenseByCategory[];
}

export interface LoginType {
  token: string;
  user: User;
}
