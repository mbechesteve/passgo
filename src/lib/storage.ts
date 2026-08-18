import AsyncStorage from "@react-native-async-storage/async-storage";

// Thin JSON wrapper over AsyncStorage — the app's local persistence layer.
// On native it's backed by SQLite/UserDefaults; on web it's backed by the
// browser's localStorage. This (plus the Zustand `persist` stores) is what
// replaced Supabase: everything is stored on-device, works fully offline.
export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const v = await AsyncStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  },
  async setJSON(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // best-effort cache; ignore quota/serialization errors
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const cacheKey = (name: string) => `pamoja:cache:${name}`;
