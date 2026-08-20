import { beforeEach, describe, expect, it } from "vitest";

import webStorage from "@/lib/web-storage";

// vitest runs in the `node` environment, so there is no localStorage. The shim has
// to work against whatever `globalThis.localStorage` is at call time, not at import
// time, or it captures undefined and every store silently stops persisting.
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
});

describe("the AsyncStorage shim", () => {
  it("round-trips a value", async () => {
    await webStorage.setItem("pamoja-pass", '{"issued":1}');
    expect(await webStorage.getItem("pamoja-pass")).toBe('{"issued":1}');
  });

  it("returns null for a key that was never set", async () => {
    expect(await webStorage.getItem("absent")).toBeNull();
  });

  it("removes a key", async () => {
    await webStorage.setItem("k", "v");
    await webStorage.removeItem("k");
    expect(await webStorage.getItem("k")).toBeNull();
  });

  it("resolves to null rather than throwing when there is no localStorage", async () => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
    expect(await webStorage.getItem("k")).toBeNull();
    await expect(webStorage.setItem("k", "v")).resolves.toBeUndefined();
  });

  it("swallows a quota failure so a full disk cannot break a render", async () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => null,
      setItem: () => { throw new Error("QuotaExceededError"); },
      removeItem: () => {},
    };
    await expect(webStorage.setItem("k", "v")).resolves.toBeUndefined();
  });
});
