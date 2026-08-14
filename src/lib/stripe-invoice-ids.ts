import type Stripe from "stripe";

function idFromExpandable(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Basil+ uses parent.subscription_details; older APIs used top-level subscription. */
export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = idFromExpandable(
    invoice.parent?.subscription_details?.subscription,
  );
  if (fromParent) return fromParent;

  const legacy = (
    invoice as Stripe.Invoice & {
      subscription?: string | { id: string } | null;
    }
  ).subscription;
  return idFromExpandable(legacy);
}

export function customerIdFromInvoice(invoice: Stripe.Invoice): string | null {
  return idFromExpandable(invoice.customer);
}

export function paymentIntentIdFromInvoice(
  invoice: Stripe.Invoice,
): string | null {
  const legacy = (
    invoice as Stripe.Invoice & {
      payment_intent?: string | { id: string } | null;
    }
  ).payment_intent;
  return idFromExpandable(legacy);
}

export function expandableId(
  value: string | { id: string } | null | undefined,
): string | null {
  return idFromExpandable(value);
}
