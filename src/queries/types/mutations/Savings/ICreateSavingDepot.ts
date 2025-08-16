export interface ICreateSavingDepot {
  name: string;
  short: string;
  currency?: string | null;
  savinggoal?: number | null;
}
export interface IReturn {
  id: string;
  name: string;
  short: string;
  currency?: string | null;
  savinggoal?: number | null;
}
