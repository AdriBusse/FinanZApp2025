import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

// Schema: signup(data: RegisterInput!): User
// RegisterInput { username: String!, email: String!, password: String! }
export const SIGNUP_MUTATION = gql`
  mutation Signup($data: RegisterInput!) {
    signup(data: $data) {
      id
      username
      email
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;
