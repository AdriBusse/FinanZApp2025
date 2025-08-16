import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple, typed wrapper over AsyncStorage with namespaced keys
const NS = 'finanz:';

// Resolve current user id lazily to avoid circular deps
function getCurrentUserId(): string | null {
  try {
    // Lazy require to avoid static import cycles in RN bundlers
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('../store/auth');
    const u = useAuthStore.getState().user;
    // Prefer stable unique id; gracefully fallback to username/email if needed
    return (u?.id || u?.username || u?.email) ?? null;
  } catch {
    return null;
  }
}

function userPrefix() {
  const id = getCurrentUserId();
  return id ? `u:${id}:` : '';
}

function userKey(key: string) {
  return `${NS}${userPrefix()}${key}`;
}

function globalKey(key: string) {
  return `${NS}${key}`;
}

export const storage = {
  async getString(key: string): Promise<string | null> {
    try {
      const id = getCurrentUserId();
      if (id) {
        // Prefer user-scoped value, fallback to legacy global key
        const val = await AsyncStorage.getItem(userKey(key));
        if (val !== null) return val;
        const legacy = await AsyncStorage.getItem(globalKey(key));
        // Migrate legacy value into user scope for future reads
        if (legacy !== null) {
          try {
            await AsyncStorage.setItem(userKey(key), legacy);
            // Remove legacy key so it doesn't migrate into other users
            await AsyncStorage.removeItem(globalKey(key));
          } catch {}
          return legacy;
        }
        return null;
      }
      return await AsyncStorage.getItem(globalKey(key));
    } catch {
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      const id = getCurrentUserId();
      if (id) {
        await AsyncStorage.setItem(userKey(key), value);
      } else {
        await AsyncStorage.setItem(globalKey(key), value);
      }
    } catch {
      // noop
    }
  },

  async getBoolean(key: string, defaultValue = false): Promise<boolean> {
    const v = await storage.getString(key);
    if (v === null) return defaultValue;
    return v === '1' || v === 'true';
  },

  async setBoolean(key: string, value: boolean): Promise<void> {
    await storage.setString(key, value ? '1' : '0');
  },

  async getJSON<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const s = await storage.getString(key);
    if (!s) return defaultValue;
    try {
      return JSON.parse(s) as T;
    } catch {
      return defaultValue;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await storage.setString(key, JSON.stringify(value));
    } catch {
      // noop
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const id = getCurrentUserId();
      if (id) {
        await AsyncStorage.removeItem(userKey(key));
        // Also clean up legacy global key if present
        await AsyncStorage.removeItem(globalKey(key));
      } else {
        await AsyncStorage.removeItem(globalKey(key));
      }
    } catch {
      // noop
    }
  },
};

// User-only helpers (no legacy/global fallback). Useful for keys that must never leak across users.
export const userStorage = {
  async getBoolean(key: string, defaultValue = false): Promise<boolean> {
    const v = await userStorage.getString(key);
    if (v === null) return defaultValue;
    return v === '1' || v === 'true';
  },
  async getString(key: string): Promise<string | null> {
    const id = getCurrentUserId();
    if (!id) return null;
    try {
      return await AsyncStorage.getItem(userKey(key));
    } catch {
      return null;
    }
  },
  async setString(key: string, value: string): Promise<void> {
    const id = getCurrentUserId();
    if (!id) return; // avoid writing to global when user unknown
    try {
      await AsyncStorage.setItem(userKey(key), value);
    } catch {}
  },
  async setBoolean(key: string, value: boolean): Promise<void> {
    await userStorage.setString(key, value ? '1' : '0');
  },
  async getJSON<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const s = await userStorage.getString(key);
    if (!s) return defaultValue;
    try {
      return JSON.parse(s) as T;
    } catch {
      return defaultValue;
    }
  },
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await userStorage.setString(key, JSON.stringify(value));
    } catch {}
  },
  async remove(key: string): Promise<void> {
    const id = getCurrentUserId();
    if (!id) return;
    try {
      await AsyncStorage.removeItem(userKey(key));
    } catch {}
  },
};
