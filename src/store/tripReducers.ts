import type { Trip } from "@/types";

export function toggleDocItem(trip: Trip, docId: string): Trip {
  return {
    ...trip,
    documents: (trip.documents ?? []).map((d) =>
      d.id === docId ? { ...d, checked: !d.checked } : d
    ),
  };
}

export function togglePackItem(
  trip: Trip,
  list: "packing" | "shopping",
  itemId: string
): Trip {
  return {
    ...trip,
    [list]: (trip[list] ?? []).map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i
    ),
  };
}

export function setBudgetActualItem(
  trip: Trip,
  itemId: string,
  actualKes: number | undefined
): Trip {
  return {
    ...trip,
    budget: (trip.budget ?? []).map((b) =>
      b.id === itemId ? { ...b, actualKes } : b
    ),
  };
}
