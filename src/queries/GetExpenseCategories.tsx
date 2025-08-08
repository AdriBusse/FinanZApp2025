import {gql} from '@apollo/client';

export const GETEXPENSECATEGORIES = gql`
  query GETEXPENSECATEGORY {
    getExpenseCategories {
      id
      name
      color
      icon
    }
  }
`;
