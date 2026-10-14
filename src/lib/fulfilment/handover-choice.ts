export type FulfilmentChoiceValue = "PICKUP" | "DELIVERY" | "BOTH";
export type HandoverValue = "COLLECT" | "DELIVER";

export const FULFILMENT_CHOICE_LABELS: Record<FulfilmentChoiceValue, string> = {
  PICKUP: "Pickup only",
  DELIVERY: "Delivery only",
  BOTH: "Pickup and delivery",
};

export const CART_MIX_HANDOVER =
  "Some items are pickup only and others are delivery only. Please place them as separate orders.";
export const DELIVERY_NEEDS_CARD = "Delivery orders are paid by card.";

export function parseFulfilmentChoice(value: unknown): FulfilmentChoiceValue | null {
  return value === "PICKUP" || value === "DELIVERY" || value === "BOTH" ? value : null;
}

export function parseHandover(value: unknown): HandoverValue | null {
  return value === "COLLECT" || value === "DELIVER" ? value : null;
}

/** Pre-order products follow their page's handover; take-now products their own setting, else the stand's. */
export function effectiveFulfilment(
  product: { isPreOrder: boolean; handoverMode: string; fulfilment: FulfilmentChoiceValue | null },
  standDefault: FulfilmentChoiceValue,
): FulfilmentChoiceValue {
  if (product.isPreOrder) return product.handoverMode === "DELIVER" ? "DELIVERY" : "PICKUP";
  return product.fulfilment ?? standDefault;
}

export type CartHandoverOptions = { pickup: boolean; delivery: boolean };

export function cartHandoverOptions(choices: FulfilmentChoiceValue[]): CartHandoverOptions {
  return {
    pickup: choices.every((c) => c !== "DELIVERY"),
    delivery: choices.every((c) => c !== "PICKUP"),
  };
}

/** The handover for a cart: the shopper's pick when allowed, else the only option (pickup first). */
export function resolveCartHandover(
  choices: FulfilmentChoiceValue[],
  requested?: HandoverValue | null,
): { mode: HandoverValue } | { error: string } {
  const options = cartHandoverOptions(choices);
  if (!options.pickup && !options.delivery) return { error: CART_MIX_HANDOVER };
  if (requested === "DELIVER") {
    return options.delivery ? { mode: "DELIVER" } : { error: "Delivery isn't available for these items." };
  }
  if (requested === "COLLECT") {
    return options.pickup ? { mode: "COLLECT" } : { error: "Pickup isn't available for these items." };
  }
  return { mode: options.pickup ? "COLLECT" : "DELIVER" };
}
