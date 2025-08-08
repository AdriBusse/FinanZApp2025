import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from '../store/auth';

// NOTE: Update this URL to your backend GraphQL endpoint.
// The schema is located at .ai/backend_graphql_schema.json
// Following the guidelines in .ai/project_description.md, the app will use Apollo Client.
// If you have a different endpoint, set it here or provide via native config.
const GRAPHQL_URL = 'http://168.119.49.31:4200/graphql';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

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
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
