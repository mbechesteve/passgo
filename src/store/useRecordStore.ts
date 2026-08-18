import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PassEvent } from "@/types";

// The record. Append-only, and the ONLY writer of lines in the app.
//
// It lives on the fan's device, which is not a prototype shortcut: Section 09 of
// the proposal is explicit that a fan sees her own complete journey on her own
// device while no institutional dashboard ever assembles that view of anyone.
// When a backend lands, only aggregates leave. Do not "fix" this by syncing
// whole records to a server.

// The record is the app's source of truth for savings, so a failed write must
// surface rather than fail silently — unlike the reference-data cache in
// storage.ts, where swallowing a quota error is harmless.
const loudStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      useRecordStore.setState({ storageError: true });
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      useRecordStore.setState({ storageError: true });
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      useRecordStore.setState({ storageError: true });
    }
  },
};

interface RecordState {
  events: PassEvent[];
  hydrated: boolean;
  /** True once a read or write failed; the Wallet shows a banner. */
  storageError: boolean;
  /** A use that happened through the app — a scan or a tap. */
  append: (event: PassEvent) => void;
  /**
   * A use that happened at a counter, where the fan read her card code aloud and
   * never touched her phone. It arrives inbound rather than from a tap in the
   * app; in the prototype it is simulated, against a real backend it is a push.
   * Keeping this path separate is what makes the no-exclusion promise real.
   */
  ingestShortCode: (event: PassEvent) => void;
  clear: () => void;
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set) => ({
      events: [],
      hydrated: false,
      storageError: false,
      append: (event) => set((s) => ({ events: [...s.events, event] })),
      ingestShortCode: (event) =>
        set((s) => ({
          events: [...s.events, { ...event, channel: "shortcode" as const }],
        })),
      clear: () => set({ events: [] }),
    }),
    {
      name: "pamoja-record",
      storage: createJSONStorage(() => loudStorage),
      onRehydrateStorage: () => (_state, error) => {
        useRecordStore.setState({
          hydrated: true,
          storageError: error != null,
        });
      },
    }
  )
);
