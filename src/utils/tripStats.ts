import type { BudgetItem, DocItem, PackItem } from "@/types";

function checkedProgress(items: { checked: boolean }[]) {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  return { done, total, pct: total === 0 ? 0 : done / total };
}

export const docProgress = (docs?: DocItem[]) => checkedProgress(docs ?? []);
export const packProgress = (items?: PackItem[]) => checkedProgress(items ?? []);

export function budgetTotals(items?: BudgetItem[]) {
  const list = items ?? [];
  const estimated = list.reduce((s, i) => s + (i.estimatedKes ?? 0), 0);
  const actual = list.reduce((s, i) => s + (i.actualKes ?? 0), 0);
  return { estimated, actual, pct: estimated === 0 ? 0 : actual / estimated };
}
