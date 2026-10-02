"use client";

import type { CartItemInput } from "@/lib/checkout";
import { completeSquareWalletCheckout } from "./square-checkout-actions";
import type { SquareWalletMethod } from "./use-square-sdk";

export type SquareWalletPayProps = {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
  onError: (message: string) => void;
  onSuccess: (orderNumber: string) => void;
};

export async function runSquareWalletPay(
  method: SquareWalletMethod,
  props: SquareWalletPayProps,
  start: (fn: () => Promise<void>) => void,
) {
  const tokenResult = await method.tokenize();
  if (tokenResult.status !== "OK" || !tokenResult.token) {
    props.onError("Wallet payment was cancelled or declined.");
    return;
  }
  const token = tokenResult.token;
  start(async () => {
    try {
      const done = await completeSquareWalletCheckout({
        standSlug: props.standSlug,
        items: props.items,
        customerChoiceAmountCents: props.customerChoiceAmountCents,
        customerName: props.customerName,
        customerEmail: props.customerEmail,
        customerPhone: props.customerPhone,
        couponCode: props.couponCode,
        sourceId: token,
      });
      if ("error" in done && done.error) {
        props.onError(done.error);
        return;
      }
      if ("orderNumber" in done && done.orderNumber) {
        props.onSuccess(done.orderNumber);
      }
    } catch {
      props.onError("Card payment failed.");
    }
  });
}
