import {gql} from '@apollo/client';

export const GETETFDETAIL = gql`
  query GETETFDETAILS($id: String!) {
    getETF(id: $id) {
      id
      name
      title
      isin
      wkn
      deposited
      worth
      amount
      transactions {
        id
        invest
        fee
        amount
        value
        createdAt
      }
    }
  }
`;
