import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserProfile } from "@/types";

interface AppState extends UserProfile {
  hydrated: boolean;
  setPassport: (countryCode: string) => void;
  setPremium: (isPremium: boolean) => void;
  toggleVisited: (countryCode: string) => void;
  toggleBucketList: (countryCode: string) => void;
  /** Return to passport selection without losing visited / bucket list / premium. */
  changePassport: () => void;
  /** Full wipe — back to a fresh install. */
  reset: () => void;
}

const initialProfile: UserProfile = {
  passportCountry: "", // empty → onboarding required
  isPremium: false,
  visitedCountryCodes: [],
  bucketListCountryCodes: [],
  savedTripIds: [],
};

const toggle = (list: string[], code: string) =>
  list.includes(code) ? list.filter((c) => c !== code) : [...list, code];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialProfile,
      hydrated: false,
      setPassport: (countryCode) => set({ passportCountry: countryCode }),
      setPremium: (isPremium) => set({ isPremium }),
      toggleVisited: (code) =>
        set((s) => ({ visitedCountryCodes: toggle(s.visitedCountryCodes, code) })),
      toggleBucketList: (code) =>
        set((s) => ({
          bucketListCountryCodes: toggle(s.bucketListCountryCodes, code),
        })),
      changePassport: () => set({ passportCountry: "" }),
      reset: () => set({ ...initialProfile }),
    }),
    {
      name: "passgo-profile",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    }
  )
);
