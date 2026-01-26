import { gql } from '@apollo/client';

export const SIGNUP = gql`
  mutation Signup($data: RegisterInput!) {
    signup(data: $data) {
      id
      username
      firstName
      email
    }
  }
`;
