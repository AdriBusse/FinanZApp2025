import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from '../store/auth';

// NOTE: Update this URL to your backend GraphQL endpoint.
// The schema is located at .ai/backend_graphql_schema.json
// Following the guidelines in .ai/project_description.md, the app will use Apollo Client.
// If you have a different endpoint, set it here or provide via native config.
console.log(process.env.API_URL);

const httpLink = new HttpLink({ uri: "https://apifinanzv2.ghettohippy.de/graphql" });

let isLoggingOut = false;
const errorLink = onError(({ graphQLErrors, networkError }) => {
  try {
    if (graphQLErrors && graphQLErrors.length) {
      // Surface GraphQL errors to debug console to aid diagnosis
      // Each item may contain message, locations, path, and extensions
      // eslint-disable-next-line no-console
      console.error('[Apollo] GraphQL errors:', graphQLErrors);
    }
    if (networkError) {
      // eslint-disable-next-line no-console
      console.error('[Apollo] Network error:', networkError);
    }
  } catch {}
  const hasUnauth =
    (graphQLErrors || []).some((e: any) => {
      const code = e?.extensions?.code;
      return code === 'UNAUTHENTICATED' || code === 'FORBIDDEN';
    }) ||
    (networkError as any)?.statusCode === 401;
  if (hasUnauth) {
    if (isLoggingOut) return;
    isLoggingOut = true;
    try {
      // Lazy import to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAuthStore } = require('../store/auth');
      Promise.resolve(useAuthStore.getState().logout()).finally(() => {
        isLoggingOut = false;
      });
    } catch {
      isLoggingOut = false;
    }
  }
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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
