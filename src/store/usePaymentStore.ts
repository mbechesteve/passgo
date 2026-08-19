import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PaymentKind, PaymentMethod } from "@/types";
import { addMethod, makeMethod, removeMethod, setDefault } from "@/utils/payment";

/**
 * How the fan pays — a list of methods, and which one is the default.
 *
 * Deliberately NOT a balance. Rev. 2 §05 is that Pamoja never holds funds and never
 * sees a card number, so there is nothing here to top up, nothing to spend down, and no
 * transaction history: the record already holds what happened. `add` takes the raw
 * input, hands it to `makeMethod`, and only the digit tail is ever put into state — the
 * number the fan typed does not reach this store, let alone the disk.
 */
interface PaymentState {
  methods: PaymentMethod[];
  hydrated: boolean;
  /** `raw` is consumed here and discarded; only its tail is stored. */
  add: (kind: PaymentKind, raw: string) => void;
  choose: (id: string) => void;
  forget: (id: string) => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      methods: [],
      hydrated: false,
      add: (kind, raw) =>
        set((s) => ({
          methods: addMethod(s.methods, makeMethod(kind, raw, s.methods.length + 1)),
        })),
      choose: (id) => set((s) => ({ methods: setDefault(s.methods, id) })),
      forget: (id) => set((s) => ({ methods: removeMethod(s.methods, id) })),
    }),
    {
      name: "pamoja-payment",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        usePaymentStore.setState({ hydrated: true });
      },
    }
  )
);
