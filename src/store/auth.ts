import { create } from 'zustand';
import {
  getSecureTokenWithBiometric,
  setSecureToken,
  resetSecureToken,
} from '../services/secureToken';
import { ME_QUERY } from '../queries/auth/me';
import { signOutFromGoogle } from '../services/googleAuth';

export interface User {
  id: string;
  username?: string;
  email?: string;
  linkedProviders: Array<'GOOGLE'>;
  hasPassword: boolean;
}

export type GoogleLoginResult =
  | { status: 'AUTHENTICATED' }
  | {
      status: 'REGISTRATION_REQUIRED' | 'LINK_REQUIRED';
      verifiedEmail: string;
    };

interface AuthState {
  token: string | null;
  user: User | null;
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<GoogleLoginResult>;
  completeGoogleSignup: (idToken: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  initFromStorage: () => Promise<void>;
}

const USER_KEY = 'auth.user';

// Safe AsyncStorage access for test environments
const getStorage = () => {
  try {
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

const persistAuthenticatedSession = async (
  set: (state: Partial<AuthState>) => void,
  token: string,
): Promise<void> => {
  const storage = getStorage();
  // Set first so Apollo includes the new session in Me verification.
  set({ token });
  await setSecureToken(token);

  try {
    // Lazy import avoids the Apollo/auth-store module cycle during startup.
    const { apolloClient } = require('../apollo/client');
    await apolloClient.clearStore();
    const meRes = await apolloClient.query({
      query: ME_QUERY,
      fetchPolicy: 'no-cache',
    });
    const me: User | null = meRes?.data?.me ?? null;
    if (!me) throw new Error('Verification failed');
    await storage.setItem(USER_KEY, JSON.stringify(me));
    set({ token, user: me });
  } catch (error) {
    try {
      const { apolloClient } = require('../apollo/client');
      await Promise.all([
        resetSecureToken(),
        storage.multiRemove([USER_KEY]),
        apolloClient.clearStore(),
      ]);
    } catch {}
    set({ token: null, user: null });
    throw error;
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
    } catch {
      set({ token: null, user: null, isInitializing: false });
    }
  },
  login: async (username: string, password: string) => {
    const uname = (username ?? '').trim();
    const pwd = password ?? '';
    if (!uname || !pwd) throw new Error('Invalid username or password');

    // Execute GraphQL LOGIN mutation against backend
    try {
      // Lazy import to avoid circular deps in native envs
      const { apolloClient } = require('../apollo/client');
      const { LOGIN } = require('../queries/mutations/auth/login');

      const result = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { username: uname, password: pwd },
        fetchPolicy: 'no-cache',
      });

      const payload = result?.data?.login;
      if (!payload?.token) {
        throw new Error('Invalid login response');
      }

      await persistAuthenticatedSession(set, payload.token);

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
  googleLogin: async (idToken: string) => {
    const { apolloClient } = require('../apollo/client');
    const { GOOGLE_LOGIN } = require('../queries/mutations/auth/googleAuth');
    const result = await apolloClient.mutate({
      mutation: GOOGLE_LOGIN,
      variables: { idToken },
      fetchPolicy: 'no-cache',
    });
    const payload = result?.data?.googleLogin;
    if (!payload?.status) throw new Error('Invalid Google login response');

    if (payload.status === 'AUTHENTICATED') {
      if (!payload.token) throw new Error('Invalid Google login response');
      await persistAuthenticatedSession(set, payload.token);
      return { status: 'AUTHENTICATED' } as const;
    }
    if (
      payload.status === 'REGISTRATION_REQUIRED' ||
      payload.status === 'LINK_REQUIRED'
    ) {
      return {
        status: payload.status,
        verifiedEmail: payload.verifiedEmail,
      } as GoogleLoginResult;
    }
    throw new Error('Unsupported Google login response');
  },
  completeGoogleSignup: async (idToken: string, username: string) => {
    const { apolloClient } = require('../apollo/client');
    const {
      COMPLETE_GOOGLE_SIGNUP,
    } = require('../queries/mutations/auth/googleAuth');
    const result = await apolloClient.mutate({
      mutation: COMPLETE_GOOGLE_SIGNUP,
      variables: { idToken, username: username.trim() },
      fetchPolicy: 'no-cache',
    });
    const payload = result?.data?.completeGoogleSignup;
    if (payload?.status !== 'AUTHENTICATED' || !payload.token) {
      throw new Error('Google signup failed');
    }
    await persistAuthenticatedSession(set, payload.token);
  },
  logout: async () => {
    const storage = getStorage();
    // Clear in-memory auth first so subsequent operations don't use a stale token
    set({ token: null, user: null });
    await Promise.all([
      resetSecureToken(),
      storage.multiRemove([USER_KEY]),
      signOutFromGoogle(),
    ]);

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
