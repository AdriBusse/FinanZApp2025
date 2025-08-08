export interface IETF {
  id: string;
  name: string;
  short: string;
  worth: number;
  deposited: number;
  transactions: IETFTransaction[];
  snapshots: IETFSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface IETFSnapshot {
  id: string;
  value: number;
  etf: IETF;
  etfId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IETFTransaction {
  id: string;
  amount: number;
  etf: IETF;
  etfId: string;
  createdAt: string;
  updatedAt: string;
}
