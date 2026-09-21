import type Stripe from "stripe";
import { subscriptionIdFromInvoice } from "@/lib/stripe-invoice-ids";

export type PaidSubscriptionInvoice = {
  id: string;
  number: string | null;
  amountCents: number;
  currency: string;
  paidAt: Date;
};

/** Paid SaaS subscription invoices for a Stripe customer, newest last from the API. */
export async function listPaidSubscriptionInvoices(
  stripe: Stripe,
  customerId: string,
): Promise<PaidSubscriptionInvoice[]> {
  const rows: PaidSubscriptionInvoice[] = [];
  for await (const invoice of stripe.invoices.list({
    customer: customerId,
    status: "paid",
    limit: 100,
  })) {
    if (!invoice.id || !subscriptionIdFromInvoice(invoice)) continue;
    if (invoice.amount_paid <= 0) continue;
    const paidAtUnix = invoice.status_transitions?.paid_at ?? invoice.created;
    rows.push({
      id: invoice.id,
      number: invoice.number,
      amountCents: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      paidAt: new Date(paidAtUnix * 1000),
    });
  }
  return rows;
}

/** Sum amount_paid on paid subscription invoices for a Stripe customer. */
export async function sumPaidSubscriptionInvoiceCents(
  stripe: Stripe,
  customerId: string,
): Promise<number> {
  const invoices = await listPaidSubscriptionInvoices(stripe, customerId);
  return invoices.reduce((total, invoice) => total + invoice.amountCents, 0);
}
