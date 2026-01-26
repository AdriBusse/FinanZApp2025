import { gql } from '@apollo/client';

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    )
  }
`;
