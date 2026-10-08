"use client";

import {
  completeSquareCheckout,
  startSquareCheckout,
} from "./square-checkout-actions";
import type { SquareCheckoutCartInput } from "@/lib/square/checkout-create-order";
import type { SquareCard } from "./use-square-sdk";

export type SquarePaySession = {
  orderId: string;
  applicationId: string;
  locationId: string;
  amountCents: number;
  currency: string;
  /** Deposit orders keep the card on file for the balance. */
  saveCard: boolean;
};

export async function continueSquareCardPay(
  input: SquareCheckoutCartInput & {
    session: SquarePaySession | null;
    card: Pick<SquareCard, "tokenize"> | null;
  },
): Promise<
  | { kind: "session"; session: SquarePaySession }
  | { kind: "paid"; orderNumber: string }
  | { kind: "error"; message: string }
> {
  const { session, card, ...cart } = input;
  if (!session) {
    const started = await startSquareCheckout(cart);
    if ("error" in started && started.error) {
      return { kind: "error", message: started.error };
    }
    if (!("orderId" in started) || !started.orderId) {
      return { kind: "error", message: "Could not start card checkout." };
    }
    return {
      kind: "session",
      session: {
        orderId: started.orderId,
        applicationId: started.applicationId,
        locationId: started.locationId,
        amountCents: started.amountCents,
        currency: started.currency,
        saveCard: started.saveCard,
      },
    };
  }

  if (!card) {
    return { kind: "error", message: "Card form is still loading." };
  }
  const result = session.saveCard
    ? await card.tokenize({
        intent: "CHARGE_AND_STORE",
        amount: (session.amountCents / 100).toFixed(2),
        currencyCode: session.currency.toUpperCase(),
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: {
          givenName: (cart.customerName ?? "").trim(),
          email: (cart.customerEmail ?? "").trim(),
        },
      })
    : await card.tokenize();
  if (result.status !== "OK" || !result.token) {
    return { kind: "error", message: "Card was not accepted. Try again." };
  }
  const done = await completeSquareCheckout({
    orderId: session.orderId,
    sourceId: result.token,
  });
  if ("error" in done && done.error) {
    return { kind: "error", message: done.error };
  }
  if ("orderNumber" in done && done.orderNumber) {
    return { kind: "paid", orderNumber: done.orderNumber };
  }
  return { kind: "error", message: "Card payment failed." };
}
