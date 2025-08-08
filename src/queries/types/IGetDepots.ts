export interface IGetDepots {
  getSavingDepots: Array<DepotData>;
}

interface DepotData {
  name: string;
  id: string;
  sum: number;
}
