import type { PaymentMethod, PaymentKind } from "@/types";

/** The kinds the redemption screen already promises: "M-Pesa, Airtel Money or card". */
export const KINDS: PaymentKind[] = ["mpesa", "airtel", "card"];

const LABEL: Record<PaymentKind, string> = {
  mpesa: "M-Pesa",
  airtel: "Airtel Money",
  card: "Card",
};

/** How many digits of each kind are kept — enough to recognise, useless to anyone else. */
const TAIL_LENGTH: Record<PaymentKind, number> = { mpesa: 3, airtel: 3, card: 4 };

/** The last `count` digits of whatever was typed, ignoring spaces, dashes and prefixes. */
export function tailOf(raw: string, count: number): string {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-count);
}

/**
 * Builds a method from what the fan typed — and keeps only the tail.
 *
 * The raw number does not survive this function, in any field. That is not a
 * convenience: Rev. 2 §05 is that Pamoja never sees a card number, so the only way to
 * keep the claim true is for the full value never to reach the store in the first
 * place. A test asserts the serialised method contains none of the input.
 */
export function makeMethod(
  kind: PaymentKind,
  raw: string,
  seq: number
): PaymentMethod {
  return {
    id: `pm-${kind}-${seq}`,
    kind,
    tail: tailOf(raw, TAIL_LENGTH[kind]),
    isDefault: false,
  };
}

/** "M-Pesa · •••789", "Card · •••• 4921" — how a fan would say it aloud. */
export function describeMethod(method: PaymentMethod): string {
  const dots = method.kind === "card" ? "•••• " : "•••";
  return `${LABEL[method.kind]} · ${dots}${method.tail}`;
}

/** The method a payment would use, or null when the fan has added none. */
export function defaultMethod(methods: PaymentMethod[]): PaymentMethod | null {
  if (methods.length === 0) return null;
  return methods.find((m) => m.isDefault) ?? methods[0];
}

/** The first method added becomes the default, so nothing has to be chosen twice. */
export function addMethod(
  methods: PaymentMethod[],
  method: PaymentMethod
): PaymentMethod[] {
  return [...methods, { ...method, isDefault: methods.length === 0 }];
}

export function setDefault(
  methods: PaymentMethod[],
  id: string
): PaymentMethod[] {
  return methods.map((m) => ({ ...m, isDefault: m.id === id }));
}

/** Removing the default promotes a survivor rather than leaving a list with none. */
export function removeMethod(
  methods: PaymentMethod[],
  id: string
): PaymentMethod[] {
  const left = methods.filter((m) => m.id !== id);
  if (left.length === 0 || left.some((m) => m.isDefault)) return left;
  return left.map((m, i) => ({ ...m, isDefault: i === 0 }));
}
