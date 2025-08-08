// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { gql } from '@apollo/client';

export interface ICreateSavingTransaction {
  describtion: string;
  amount: number;
  depotId: string;
}
export interface IReturn {
  id: string;
}
