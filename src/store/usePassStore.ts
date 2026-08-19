import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { HostCountry, Match, MatchTicket, Pass } from "@/types";
import { issuePass } from "@/utils/issue";
import { issueTicket } from "@/utils/ticket";

// Identity + entitlement. Never writes to the record — useRecordStore owns lines.

interface PassState {
  pass: Pass | null;
  /** The seat for the next fixture, distinct from the credential above. */
  ticket: MatchTicket | null;
  /** How many Passes this device has issued; drives the serial number. */
  issued: number;
  hydrated: boolean;
  issue: (input: { holderName: string; issuedIn: HostCountry }) => void;
  suspend: () => void;
  issueTicketFor: (match: Match) => void;
  reset: () => void;
}

export const usePassStore = create<PassState>()(
  persist(
    (set, get) => ({
      pass: null,
      ticket: null,
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
      issueTicketFor: (match: Match) =>
        set((s) => ({
          ticket: s.pass ? issueTicket(s.pass, match) : null,
        })),
      reset: () => set({ pass: null, ticket: null, issued: 0 }),
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
