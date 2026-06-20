import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Attraction, Trip, TripItem } from "@/types";

interface TripState {
  trips: Trip[];
  activeTripId: string | null;

  createTrip: (countryCode: string, title: string) => string;
  deleteTrip: (tripId: string) => void;
  setActiveTrip: (tripId: string | null) => void;
  updateTripMeta: (
    tripId: string,
    meta: Partial<Pick<Trip, "title" | "startDate" | "endDate" | "accommodation">>
  ) => void;

  addAttraction: (tripId: string, attraction: Attraction) => void;
  removeItem: (tripId: string, itemId: string) => void;
  updateItem: (
    tripId: string,
    itemId: string,
    patch: Partial<Pick<TripItem, "note" | "date" | "title">>
  ) => void;
  /** Replace the ordered item list for a single city after a drag reorder. */
  reorderCityItems: (tripId: string, cityId: string, items: TripItem[]) => void;
}

// Deterministic-ish id without Date.now (unavailable in some sandboxes at build
// time); a monotonic counter seeded per session is plenty for local trips.
let counter = 0;
const uid = (prefix: string) => `${prefix}_${(counter += 1)}_${Math.floor(Math.random() * 1e6)}`;

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,

      createTrip: (countryCode, title) => {
        const id = uid("trip");
        const trip: Trip = {
          id,
          countryCode,
          title,
          items: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ trips: [trip, ...s.trips], activeTripId: id }));
        return id;
      },

      deleteTrip: (tripId) =>
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== tripId),
          activeTripId: s.activeTripId === tripId ? null : s.activeTripId,
        })),

      setActiveTrip: (tripId) => set({ activeTripId: tripId }),

      updateTripMeta: (tripId, meta) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? { ...t, ...meta } : t)),
        })),

      addAttraction: (tripId, attraction) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            if (t.items.some((i) => i.attractionId === attraction.id)) return t; // no dupes
            const cityCount = t.items.filter(
              (i) => i.cityId === attraction.cityId
            ).length;
            const item: TripItem = {
              id: uid("item"),
              attractionId: attraction.id,
              cityId: attraction.cityId,
              title: attraction.name,
              order: cityCount,
            };
            return { ...t, items: [...t.items, item] };
          }),
        })),

      removeItem: (tripId, itemId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
              : t
          ),
        })),

      updateItem: (tripId, itemId, patch) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  items: t.items.map((i) =>
                    i.id === itemId ? { ...i, ...patch } : i
                  ),
                }
              : t
          ),
        })),

      reorderCityItems: (tripId, cityId, reordered) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            const others = t.items.filter((i) => i.cityId !== cityId);
            const renumbered = reordered.map((i, idx) => ({ ...i, order: idx }));
            return { ...t, items: [...others, ...renumbered] };
          }),
        })),
    }),
    {
      name: "passgo-trips",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Selector helper: group a trip's items by city, ordered. */
export function groupItemsByCity(trip: Trip | undefined) {
  const map = new Map<string, TripItem[]>();
  if (!trip) return map;
  for (const item of trip.items) {
    const arr = map.get(item.cityId) ?? [];
    arr.push(item);
    map.set(item.cityId, arr);
  }
  for (const [, arr] of map) arr.sort((a, b) => a.order - b.order);
  return map;
}
