import { gql } from '@apollo/client';

export const CATEGORY_METADATA_QUERY = gql`
  query CategoryMetadata {
    categoryMetadata: getCategoryMetadata {
      colors {
        hex
        label
        key
      }
      icons {
        keyword
        icon
        label
      }
    }
  }
`;
