import { create } from "zustand";

import type { Partner } from "@/types";
import { fetchPartners } from "@/data/repository";

// The partner network. Reference data, so it is not persisted here — the
// repository already mirrors it into AsyncStorage.

interface PartnerState {
  partners: Partner[];
  loaded: boolean;
  load: () => Promise<void>;
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  partners: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const partners = await fetchPartners();
    set({ partners, loaded: true });
  },
}));
