"use client";

import {
  completeSquareCheckout,
  startSquareCheckout,
} from "./square-checkout-actions";
import type { CartItemInput } from "@/lib/checkout";

type CardTokenize = {
  tokenize: () => Promise<{ status: string; token?: string }>;
};

export type SquarePaySession = {
  orderId: string;
  applicationId: string;
  locationId: string;
};

export async function continueSquareCardPay(input: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
  session: SquarePaySession | null;
  card: CardTokenize | null;
}): Promise<
  | { kind: "session"; session: SquarePaySession }
  | { kind: "paid"; orderNumber: string }
  | { kind: "error"; message: string }
> {
  if (!input.session) {
    const started = await startSquareCheckout({
      standSlug: input.standSlug,
      items: input.items,
      customerChoiceAmountCents: input.customerChoiceAmountCents,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      couponCode: input.couponCode,
    });
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
        applicationId: started.applicationId!,
        locationId: started.locationId!,
      },
    };
  }

  if (!input.card) {
    return { kind: "error", message: "Card form is still loading." };
  }
  const result = await input.card.tokenize();
  if (result.status !== "OK" || !result.token) {
    return { kind: "error", message: "Card was not accepted. Try again." };
  }
  const done = await completeSquareCheckout({
    orderId: input.session.orderId,
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
