import {gql} from '@apollo/client';

export const CREATEETFTRANSACTION = gql`
  mutation CREATEETFTRANSACTION($etfId: String!, $invest: Float, $fee: Float) {
    createETFTransaction(etfId: $etfId, invest: $invest, fee: $fee) {
      id
      invest
      fee
      amount
      value
      createdAt
    }
  }
`;
