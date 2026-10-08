import { squareFetch } from "@/lib/square/client";
import { isSquareAppFeesEnabled } from "@/lib/square/config";

export type SquareMoney = { amount: number; currency: string };

export type CreateSquarePaymentInput = {
  accessToken: string;
  sourceId: string;
  amountCents: number;
  currency: string;
  locationId: string;
  idempotencyKey: string;
  /** Vendl application fee cents (Free plan). Zero for Pro / disabled flag. */
  appFeeCents: number;
  referenceId?: string;
  note?: string;
  buyerEmail?: string;
  /** Required when `sourceId` is a saved card id. */
  customerId?: string;
  /** False for scheduled renewals charged without the shopper present. */
  customerInitiated?: boolean;
};

export async function createSquarePayment(input: CreateSquarePaymentInput) {
  const body: Record<string, unknown> = {
    source_id: input.sourceId,
    idempotency_key: input.idempotencyKey,
    amount_money: {
      amount: input.amountCents,
      currency: input.currency.toUpperCase(),
    },
    location_id: input.locationId,
    autocomplete: true,
    reference_id: input.referenceId?.slice(0, 40),
    note: input.note?.slice(0, 500),
  };

  if (
    isSquareAppFeesEnabled() &&
    input.appFeeCents > 0 &&
    input.appFeeCents < input.amountCents
  ) {
    body.app_fee_money = {
      amount: input.appFeeCents,
      currency: input.currency.toUpperCase(),
    };
  }

  if (input.buyerEmail) {
    body.buyer_email_address = input.buyerEmail;
  }
  if (input.customerId) {
    body.customer_id = input.customerId;
  }
  if (input.customerInitiated !== undefined) {
    body.customer_details = {
      customer_initiated: input.customerInitiated,
      seller_keyed_in: false,
    };
  }

  return squareFetch<{
    payment?: {
      id?: string;
      status?: string;
      order_id?: string;
      amount_money?: SquareMoney;
      app_fee_money?: SquareMoney;
    };
  }>("/v2/payments", {
    accessToken: input.accessToken,
    method: "POST",
    body,
    idempotencyKey: input.idempotencyKey,
  });
}

export async function refundSquarePayment(input: {
  accessToken: string;
  paymentId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  reason?: string;
}) {
  return squareFetch<{
    refund?: { id?: string; status?: string; payment_id?: string };
  }>("/v2/refunds", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      payment_id: input.paymentId,
      amount_money: {
        amount: input.amountCents,
        currency: input.currency.toUpperCase(),
      },
      reason: input.reason?.slice(0, 192),
    },
    idempotencyKey: input.idempotencyKey,
  });
}
