import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
// Use the ESM entry directly (package exports only .mjs files)
import defaultIsExtractableFile from 'extract-files/isExtractableFile.mjs';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { API_URL } from '@env';

import { getAuthToken } from '../store/auth';

const isReactNativeFile = (value: unknown): value is any => {
  const isCustomFile = !!(
    value &&
    typeof value === 'object' &&
    'uri' in value &&
    'name' in value &&
    'type' in value
  );

  const isFile = isCustomFile || defaultIsExtractableFile(value);

  // Only log if it looks like our file, to avoid log spam on every GraphQL node
  if (isCustomFile) {
    console.log('[Apollo] isExtractableFile evaluated true for:', value.uri);
  }

  return isFile;
};

const uploadLink = new UploadHttpLink({
  uri: API_URL,
  isExtractableFile: isReactNativeFile,
});

const authLink = new SetContextLink(async ({ headers }) => {
  // get the authentication token from local storage if it exists
  const token = await getAuthToken();
  return {
    headers: {
      ...headers,
      'apollo-require-preflight': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const requestLogLink = new ApolloLink((operation, forward) => {
  if (__DEV__) {
    console.log('[Apollo] Sending GraphQL request', {
      operation: operation.operationName || 'anonymous',
      url: API_URL,
    });
  }

  return forward(operation);
});

const errorLogLink = new ErrorLink(({ error, operation }) => {
  console.error('[Apollo] GraphQL request failed', {
    operation: operation.operationName || 'anonymous',
    url: API_URL,
    error,
  });
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([requestLogLink, errorLogLink, authLink, uploadLink]),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          summary: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
          getSavingDepots: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          getExpenses: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          getExpenseCategories: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      SavingDepot: {
        keyFields: ['id'],
        fields: {
          transactions: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Expense: {
        keyFields: ['id'],
        fields: {
          transactions: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});
