import { squareFetch } from "@/lib/square/client";
import { refundSquarePayment } from "@/lib/square/payments";
import { proportionalAppFee, type PaymentState } from "./payment-state";

type Money = { amount?: number; currency?: string };

type SquarePaymentResponse = {
  payment?: {
    id?: string;
    total_money?: Money;
    amount_money?: Money;
    refunded_money?: Money;
    app_fee_money?: Money;
  };
};

export async function squarePaymentState(
  accessToken: string,
  paymentId: string,
): Promise<PaymentState> {
  const res = await squareFetch<SquarePaymentResponse>(
    `/v2/payments/${encodeURIComponent(paymentId)}`,
    { accessToken },
  );
  const p = res.payment;
  return {
    id: p?.id ?? paymentId,
    amountCents: p?.total_money?.amount ?? p?.amount_money?.amount ?? 0,
    refundedCents: p?.refunded_money?.amount ?? 0,
    appFeeCents: p?.app_fee_money?.amount ?? 0,
  };
}

export async function refundSquare(input: {
  accessToken: string;
  payment: PaymentState;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
}) {
  return refundSquarePayment({
    accessToken: input.accessToken,
    paymentId: input.payment.id,
    amountCents: input.amountCents,
    currency: input.currency,
    appFeeCents: proportionalAppFee(input.payment, input.amountCents),
    idempotencyKey: input.idempotencyKey,
    reason: "Refunded by seller in Vendl",
  });
}
