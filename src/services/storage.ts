import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple, typed wrapper over AsyncStorage with namespaced keys
const NS = 'finanz:';

function k(key: string) {
  return `${NS}${key}`;
}

export const storage = {
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(k(key));
    } catch {
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(k(key), value);
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
      await AsyncStorage.removeItem(k(key));
    } catch {
      // noop
    }
  },
};
