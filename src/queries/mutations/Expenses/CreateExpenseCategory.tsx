import {gql} from '@apollo/client';

export const CREATEEXPANSECATEGORY = gql`
  mutation CREATEEXPENSECATEGORY(
    $name: String!
    $color: String
    $icon: String
  ) {
    createExpenseCategory(name: $name, color: $color, icon: $icon) {
      id
      name
      color
      icon
    }
  }
`;
