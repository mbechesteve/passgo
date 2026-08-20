/* The web stand-in for AsyncStorage.

   The stores persist through `createJSONStorage(() => AsyncStorage)`, which needs
   only three methods and needs them to return promises. On the web AsyncStorage is
   itself a thin wrapper over localStorage, so the portal aliases the package to
   this at build time rather than shipping the React Native one to a browser that
   has the real thing already.

   `localStorage` is read at call time, never captured at import: the bundle is an
   IIFE that may be evaluated before a document exists, and a captured `undefined`
   would turn every write into a silent no-op that only shows up as state that will
   not persist.

   Every failure resolves rather than rejects. Persistence here is best-effort — a
   private-mode browser or a full quota should cost the user their history, not
   their page. */

function store(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    // Accessing localStorage throws outright in some privacy modes.
    return null;
  }
}

export const webStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return store()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      store()?.setItem(key, value);
    } catch {
      // best-effort; quota and privacy-mode failures are not the caller's problem
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      store()?.removeItem(key);
    } catch {
      // as above
    }
  },
};

export default webStorage;
