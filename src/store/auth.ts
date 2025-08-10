import create from 'zustand';
import {
  getSecureTokenWithBiometric,
  setSecureToken,
  resetSecureToken,
} from '../services/secureToken';

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
        'Unlock to access your account'
      );

      if (!token) {
        // Biometric canceled/failed or no token stored: stay logged out
        set({ token: null, isInitializing: false });
        return;
      }

      // Set token in-memory for Apollo and UI, then validate via Me query
      set({ token });
      try {
        const { apolloClient } = require('../apollo/client');
        const { ME_QUERY } = require('../graphql/auth');
        const meRes = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'network-only',
        });
        const me = meRes?.data?.me ?? null;
        if (me) {
          await storage.setItem(USER_KEY, JSON.stringify(me));
          set({ user: me });
        }
      } catch {
        // Token invalid -> clear and require login next time
        await resetSecureToken();
        set({ token: null, user: null });
      }

      set({ isInitializing: false });
    } catch (e) {
      set({ token: null, user: null, isInitializing: false });
    }
  },
  login: async (username: string, password: string) => {
    const storage = getStorage();
    if (!username || !password) throw new Error('Missing credentials');

    // Execute GraphQL LOGIN mutation against backend
    try {
      // Lazy import to avoid circular deps in native envs
      const { apolloClient } = require('../apollo/client');
      const { LOGIN_MUTATION, ME_QUERY } = require('../graphql/auth');

      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
        fetchPolicy: 'no-cache',
      });

      const payload = result?.data?.login;
      if (!payload?.token) {
        throw new Error('Invalid login response');
      }

      // Store token securely (Keychain/Keystore) with biometric protection
      await setSecureToken(payload.token);

      // Call me endpoint to fetch latest user profile
      let me: User | null = null;
      try {
        const meRes = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'network-only',
        });
        me = meRes?.data?.me ?? null;
      } catch {
        me = payload.user ?? null;
      }

      await storage.setItem(USER_KEY, JSON.stringify(me));
      set({ token: payload.token, user: me });

      // After successful login, prefetch finance summary and other data into zustand
      try {
        const { useFinanceStore } = require('../store/finance');
        await useFinanceStore.getState().loadAll();
      } catch {
        // Swallow prefetch errors to not block login; Dashboard can retry on mount
      }
    } catch (err: any) {
      // Normalize Apollo/GraphQL errors
      const msg = err?.message || 'Login failed';
      throw new Error(msg);
    }
  },
  logout: async () => {
    const storage = getStorage();
    await resetSecureToken();
    await storage.multiRemove([USER_KEY]);
    set({ token: null, user: null });
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
