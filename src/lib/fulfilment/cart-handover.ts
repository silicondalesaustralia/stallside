import type { CartItemInput } from "@/lib/checkout";
import {
  effectiveFulfilment,
  resolveCartHandover,
  type FulfilmentChoiceValue,
  type HandoverValue,
} from "@/lib/fulfilment/handover-choice";

type HandoverProduct = {
  isPreOrder: boolean;
  handoverMode: string;
  fulfilment: FulfilmentChoiceValue | null;
};

/** Upsell add-ons ride along with the order, so only the main items decide pickup vs delivery. */
export function loadedCartHandover(
  loaded: {
    stand: { fulfilmentDefault: FulfilmentChoiceValue };
    byId: Map<string, HandoverProduct>;
  },
  items: CartItemInput[] | undefined,
  requested?: HandoverValue | null,
): { mode: HandoverValue } | { error: string } {
  const choices = (items ?? [])
    .filter((item) => !item.asUpsell)
    .map((item) => loaded.byId.get(item.productId))
    .filter((p): p is HandoverProduct => Boolean(p))
    .map((p) => effectiveFulfilment(p, loaded.stand.fulfilmentDefault));
  return resolveCartHandover(choices, requested);
}

export type DeliveryDetails = {
  deliveryAddressLine1: string;
  deliverySuburb: string;
  deliveryPostcode: string;
  deliveryNotes: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Contact checks shared by Stripe and Square: name + email for pre-orders and deliveries, address for deliveries. */
export function contactError(input: {
  needsContact: boolean;
  deliver: boolean;
  customerName: string;
  customerEmail: string;
  delivery: DeliveryDetails;
}): string | null {
  if (!input.needsContact) return null;
  if (!input.customerName) {
    return input.deliver ? "Enter your name for delivery." : "Enter your name for collection.";
  }
  if (!EMAIL_RE.test(input.customerEmail)) return "Enter a valid email for order details.";
  const d = input.delivery;
  if (input.deliver && (!d.deliveryAddressLine1 || !d.deliverySuburb || !d.deliveryPostcode)) {
    return "Enter a delivery address.";
  }
  return null;
}
