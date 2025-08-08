export interface IGetExpenseCategories {
  getExpenseCategories: Category[];
}
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}
