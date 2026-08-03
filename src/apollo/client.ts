import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
// Use the ESM entry directly (package exports only .mjs files)
import defaultIsExtractableFile from 'extract-files/isExtractableFile.mjs';
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

import { getAuthToken } from '../store/auth';

// NOTE: Update this URL to your backend GraphQL endpoint.
// The schema is located at .ai/backend_graphql_schema.json
// Following the guidelines in .ai/project_description.md, the app will use Apollo Client.
// If you have a different endpoint, set it here or provide via native config.
console.log(process.env.API_URL);



const isReactNativeFile = (value: any) => {
  const isCustomFile = !!(
    value &&
    typeof value === 'object' &&
    value.uri &&
    value.name &&
    value.type
  );

  const isFile = isCustomFile || defaultIsExtractableFile(value);

  // Only log if it looks like our file, to avoid log spam on every GraphQL node
  if (isCustomFile) {
    console.log('[Apollo] isExtractableFile evaluated true for:', value.uri);
  }

  return isFile;
};

const uploadLink = new UploadHttpLink({
  //uri: "https://apifinanzv2.ghettohippy.de/graphql",
  uri: "http://10.1.0.148:4000/graphql",
  //isExtractableFile: isReactNativeFile,
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


export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    authLink, uploadLink
  ]),
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


