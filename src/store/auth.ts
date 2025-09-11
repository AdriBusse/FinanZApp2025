import create from 'zustand';
import {
  getSecureTokenWithBiometric,
  setSecureToken,
  resetSecureToken,
} from '../services/secureToken';
import { ME_QUERY } from '../graphql/auth';

export interface User {
  id: string;
  username?: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initFromStorage: () => Promise<void>;
}

const USER_KEY = 'auth.user';

// Safe AsyncStorage access for test environments
const getStorage = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-async-storage/async-storage');
    return mod.default || mod;
  } catch {
    // in-memory fallback
    const mem: Record<string, string | null> = {};
    return {
      getItem: async (k: string) => mem[k] ?? null,
      setItem: async (k: string, v: string) => {
        mem[k] = v;
      },
      multiRemove: async (keys: string[]) => {
        keys.forEach(k => {
          mem[k] = null;
        });
      },
    } as const;
  }
};

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  user: null,
  isInitializing: true,
  initFromStorage: async () => {
    const storage = getStorage();
    try {
      // Load cached user profile (non-sensitive) without auth
      const userJson = await storage.getItem(USER_KEY);
      set({ user: userJson ? JSON.parse(userJson) : null });

      // If a secure token exists, this will prompt for Face ID/Touch ID on access
      const token = await getSecureTokenWithBiometric(
        'Unlock to access your account',
      );

      if (!token) {
        // Biometric canceled/failed or no token stored: ensure fully logged out
        try {
          await resetSecureToken();
          await (getStorage() as any).multiRemove([USER_KEY]);
          // Also clear Apollo cache to avoid stale user data
          const { apolloClient } = require('../apollo/client');
          await apolloClient.clearStore();
        } catch {}
        set({ token: null, user: null, isInitializing: false });
        return;
      }

      // Set token in-memory for Apollo and UI, then validate via Me query
      set({ token });
      try {
        const { apolloClient } = require('../apollo/client');
        const meRes = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'no-cache', // No cache for auth queries
        });
        const me = meRes?.data?.me ?? null;
        if (me) {
          await storage.setItem(USER_KEY, JSON.stringify(me));
          set({ user: me });
        }
      } catch {
        // Token invalid -> force logout: clear secure token, cached user, and Apollo cache
        try {
          await resetSecureToken();
          await storage.multiRemove([USER_KEY]);
          const { apolloClient } = require('../apollo/client');
          await apolloClient.clearStore();
        } catch {}
        set({ token: null, user: null });
      }

      set({ isInitializing: false });
    } catch (e) {
      set({ token: null, user: null, isInitializing: false });
    }
  },
  login: async (username: string, password: string) => {
    const storage = getStorage();
    const uname = (username ?? '').trim();
    const pwd = password ?? '';
    if (!uname || !pwd) throw new Error('Invalid username or password');

    // Execute GraphQL LOGIN mutation against backend
    try {
      // Lazy import to avoid circular deps in native envs
      const { apolloClient } = require('../apollo/client');
      const { LOGIN } = require('../queries/mutations/auth/login');
      const { ME_QUERY } = require('../graphql/auth');

      const result = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { username: uname, password: pwd },
        fetchPolicy: 'no-cache',
      });

      const payload = result?.data?.login;
      if (!payload?.token) {
        throw new Error('Invalid login response');
      }

      // Put token in memory immediately so subsequent requests (Me) include Authorization
      set({ token: payload.token });

      // Store token securely (Keychain/Keystore) with biometric protection (with fallbacks)
      await setSecureToken(payload.token);

      // Verify token strictly: if Me fails, force logout and abort login
      try {
        const meRes = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'no-cache', // No cache for auth verification
        });
        const me: User | null = meRes?.data?.me ?? null;
        if (!me) throw new Error('Verification failed');
        await storage.setItem(USER_KEY, JSON.stringify(me));
        set({ token: payload.token, user: me });
      } catch {
        try {
          await resetSecureToken();
          await storage.multiRemove([USER_KEY]);
          await apolloClient.clearStore();
        } catch {}
        set({ token: null, user: null });
        throw new Error('Invalid username or password');
      }

      // After successful login, let components load data as needed
      // This prevents blocking the login flow with unnecessary data loading
    } catch (err: any) {
      // Log detailed error for debugging while keeping UI error generic
      try {
        console.error('[Auth] Login error', {
          message: err?.message,
          graphQLErrors: err?.graphQLErrors,
          networkError: err?.networkError,
        });
      } catch {}
      // Always return a generic error to avoid leaking whether username or password was incorrect
      throw new Error('Invalid username or password');
    }
  },
  logout: async () => {
    const storage = getStorage();
    await resetSecureToken();
    await storage.multiRemove([USER_KEY]);
    // Clear in-memory auth first so subsequent operations don't use a stale token
    set({ token: null, user: null });

    // Also clear Apollo cache to wipe user-specific cached data
    try {
      const { apolloClient } = require('../apollo/client');
      await apolloClient.clearStore();
    } catch {
      // Ignore cache clear errors; app will refetch as needed on next login
    }
  },
}));

export const getAuthToken = async (): Promise<string | null> => {
  // Return in-memory token only to avoid triggering biometric prompts per request
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
};
