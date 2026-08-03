import { gql } from '@apollo/client';

const GOOGLE_AUTH_USER = gql`
  fragment GoogleAuthUser on User {
    id
    username
    email
    linkedProviders
    hasPassword
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      status
      token
      verifiedEmail
      user {
        ...GoogleAuthUser
      }
    }
  }
  ${GOOGLE_AUTH_USER}
`;

export const COMPLETE_GOOGLE_SIGNUP = gql`
  mutation CompleteGoogleSignup($idToken: String!, $username: String!) {
    completeGoogleSignup(idToken: $idToken, username: $username) {
      status
      token
      verifiedEmail
      user {
        ...GoogleAuthUser
      }
    }
  }
  ${GOOGLE_AUTH_USER}
`;

export const LINK_GOOGLE_ACCOUNT = gql`
  mutation LinkGoogleAccount($idToken: String!) {
    linkGoogleAccount(idToken: $idToken)
  }
`;

export const SET_PASSWORD_FOR_GOOGLE_ACCOUNT = gql`
  mutation SetPasswordForGoogleAccount(
    $idToken: String!
    $newPassword: String!
  ) {
    setPasswordForGoogleAccount(idToken: $idToken, newPassword: $newPassword)
  }
`;
