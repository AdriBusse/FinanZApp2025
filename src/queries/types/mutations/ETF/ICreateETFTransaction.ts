export interface ICreateETFTransaction {
  etfId: string;
  invest?: number;
  fee?: number;
}
export interface IReturn {
  id: string;
  invest: number;
  fee: number;
  amount: number;
  value: number;
  createdAt: string;
}
