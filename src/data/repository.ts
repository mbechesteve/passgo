// Repository layer — the single seam between the UI and its data source.
// Rebuilt for Pamoja in a later task; this is the cache helper it keeps.

import { cacheKey, storage } from "@/lib/storage";

/** Read-through cache: cached copy if present, else compute, persist, return. */
export async function cached<T>(name: string, compute: () => T): Promise<T> {
  const hit = await storage.getJSON<T>(cacheKey(name));
  if (hit != null) return hit;
  const data = compute();
  await storage.setJSON(cacheKey(name), data);
  return data;
}
