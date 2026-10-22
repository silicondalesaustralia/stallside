import type Stripe from "stripe";
import { squareFetch } from "@/lib/square/client";
import { paypalFetch } from "@/lib/paypal";
import { gstFromInclusiveCents } from "@/lib/gst";

export type ProcessorFee = {
  /** Excludes tax on the fee. */
  feeCents: number;
  /** Null when the provider does not report tax on its fee. */
  taxCents: number | null;
  currency: string;
};

/** Stripe fee + GST on it from the charge's balance transaction (direct charge on the connected account). */
export async function stripePaymentFee(
  stripe: Stripe,
  stripeAccountId: string,
  paymentIntentId: string,
): Promise<ProcessorFee | null> {
  const pi = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    { expand: ["latest_charge.balance_transaction"] },
    { stripeAccount: stripeAccountId },
  );
  const charge = pi.latest_charge;
  if (!charge || typeof charge === "string") return null;
  const txn = charge.balance_transaction;
  if (!txn || typeof txn === "string") return null;
  let feeCents = 0;
  let taxCents = 0;
  for (const detail of txn.fee_details) {
    if (detail.type === "stripe_fee") feeCents += detail.amount;
    if (detail.type === "tax") taxCents += detail.amount;
  }
  return { feeCents, taxCents, currency: txn.currency.toUpperCase() };
}

type SquarePaymentResponse = {
  payment?: {
    processing_fee?: { amount_money?: { amount?: number; currency?: string } }[];
  };
};

/** Square fills `processing_fee` shortly after capture; null until then. */
export async function squarePaymentFee(
  accessToken: string,
  paymentId: string,
): Promise<ProcessorFee | null> {
  const res = await squareFetch<SquarePaymentResponse>(
    `/v2/payments/${encodeURIComponent(paymentId)}`,
    { accessToken },
  );
  const fees = res.payment?.processing_fee ?? [];
  if (fees.length === 0) return null;
  const currency = fees[0].amount_money?.currency?.toUpperCase() ?? "";
  const grossCents = fees.reduce((sum, f) => sum + (f.amount_money?.amount ?? 0), 0);
  // Square AU fees are GST-inclusive but not itemised.
  const taxCents = currency === "AUD" ? gstFromInclusiveCents(grossCents) : null;
  return { feeCents: grossCents - (taxCents ?? 0), taxCents, currency };
}

type PayPalCaptureResponse = {
  seller_receivable_breakdown?: {
    paypal_fee?: { currency_code?: string; value?: string };
  };
};

export async function paypalCaptureFee(
  captureId: string,
): Promise<ProcessorFee | null> {
  const res = await paypalFetch<PayPalCaptureResponse>(
    `/v2/payments/captures/${encodeURIComponent(captureId)}`,
  );
  const fee = res.seller_receivable_breakdown?.paypal_fee;
  if (!fee?.value || !fee.currency_code) return null;
  return {
    feeCents: Math.round(Number(fee.value) * 100),
    taxCents: null,
    currency: fee.currency_code.toUpperCase(),
  };
}
