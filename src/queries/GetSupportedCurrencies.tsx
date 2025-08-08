import { gql } from '@apollo/client';

export const GETSUPPORTEDVSCURRENCIES = gql`
  query GetSupportedVsCurrencies {
    getSupportedVsCurrencies
  }
`;
