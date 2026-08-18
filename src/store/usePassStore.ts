import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { HostCountry, Pass } from "@/types";
import { issuePass } from "@/utils/issue";

// Identity + entitlement. Never writes to the record — useRecordStore owns lines.

interface PassState {
  pass: Pass | null;
  /** How many Passes this device has issued; drives the serial number. */
  issued: number;
  hydrated: boolean;
  issue: (input: { holderName: string; issuedIn: HostCountry }) => void;
  suspend: () => void;
  reset: () => void;
}

export const usePassStore = create<PassState>()(
  persist(
    (set, get) => ({
      pass: null,
      issued: 0,
      hydrated: false,
      issue: ({ holderName, issuedIn }) =>
        set({
          pass: issuePass({ holderName, issuedIn, sequence: get().issued }),
          issued: get().issued + 1,
        }),
      suspend: () =>
        set((s) => ({
          pass: s.pass ? { ...s.pass, status: "suspended" as const } : null,
        })),
      reset: () => set({ pass: null, issued: 0 }),
    }),
    {
      name: "pamoja-pass",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        usePassStore.setState({ hydrated: true });
      },
    }
  )
);
