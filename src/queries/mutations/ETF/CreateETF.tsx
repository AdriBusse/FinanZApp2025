import {gql} from '@apollo/client';

export const CREATEETF = gql`
  mutation CREATEEFT($isin: String!) {
    createETF(isin: $isin) {
      id
      name
    }
  }
`;
