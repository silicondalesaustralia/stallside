import type Stripe from "stripe";
import { billingCentsToAud, type AudRates } from "@/lib/fx-to-aud";

export type ApplicationFeeEvent = {
  id: string;
  accountId: string;
  amountCents: number;
  currency: string;
  createdAt: Date;
  paymentIntentId: string | null;
};

function accountId(fee: Stripe.ApplicationFee): string {
  return typeof fee.account === "string" ? fee.account : fee.account.id;
}

function paymentIntentIdFromFee(fee: Stripe.ApplicationFee): string | null {
  const charge = fee.charge;
  if (!charge || typeof charge === "string") return null;
  const pi = charge.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

/** Platform application fees (Vendl.app fee), optionally filtered by connected account. */
export async function listApplicationFeeEvents(
  stripe: Stripe,
  input: {
    start?: Date;
    end?: Date;
    accountId?: string;
  } = {},
): Promise<ApplicationFeeEvent[]> {
  const created: Stripe.RangeQueryParam = {};
  if (input.start) created.gte = Math.floor(input.start.getTime() / 1000);
  if (input.end) created.lte = Math.floor(input.end.getTime() / 1000);

  const rows: ApplicationFeeEvent[] = [];
  for await (const fee of stripe.applicationFees.list({
    ...(Object.keys(created).length ? { created } : {}),
    expand: ["data.charge"],
    limit: 100,
  })) {
    const account = accountId(fee);
    if (input.accountId && account !== input.accountId) continue;
    const net = fee.amount - fee.amount_refunded;
    if (net <= 0) continue;
    rows.push({
      id: fee.id,
      accountId: account,
      amountCents: net,
      currency: fee.currency.toUpperCase(),
      createdAt: new Date(fee.created * 1000),
      paymentIntentId: paymentIntentIdFromFee(fee),
    });
  }
  return rows;
}

export function applicationFeesToAud(
  fees: ApplicationFeeEvent[],
  rates: AudRates,
): number {
  return fees.reduce(
    (sum, fee) => sum + billingCentsToAud(fee.amountCents, fee.currency, rates),
    0,
  );
}
