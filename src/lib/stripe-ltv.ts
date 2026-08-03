import type Stripe from "stripe";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  if (fromParent) {
    return typeof fromParent === "string" ? fromParent : fromParent.id;
  }
  const legacy = (
    invoice as Stripe.Invoice & { subscription?: string | { id: string } | null }
  ).subscription;
  if (!legacy) return null;
  return typeof legacy === "string" ? legacy : legacy.id;
}

/** Sum amount_paid on paid subscription invoices for a Stripe customer. */
export async function sumPaidSubscriptionInvoiceCents(
  stripe: Stripe,
  customerId: string,
): Promise<number> {
  let total = 0;
  for await (const invoice of stripe.invoices.list({
    customer: customerId,
    status: "paid",
    limit: 100,
  })) {
    if (!subscriptionIdFromInvoice(invoice)) continue;
    if (invoice.amount_paid > 0) total += invoice.amount_paid;
  }
  return total;
}
