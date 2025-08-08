import {gql} from '@apollo/client';

export const UPDATEEXPENSECATEGORY = gql`
  mutation UPDATEEXPENSECATEGORY(
    $id: String!
    $name: String
    $color: String
    $icon: String
  ) {
    updateExpenseCategory(id: $id, name: $name, icon: $icon, color: $color) {
      id
      name
      color
      icon
    }
  }
`;
