"use server";

import { randomUUID } from "crypto";
import { loadSquarePayConfig } from "@/lib/square/checkout-config";
import {
  createPendingSquareOrder,
  type SquareCheckoutCartInput,
} from "@/lib/square/checkout-create-order";
import { chargeAndFulfillSquareOrder } from "@/lib/square/checkout-charge";

export async function getSquarePayConfig(standSlug: string) {
  try {
    return await loadSquarePayConfig(standSlug);
  } catch (error) {
    console.error("getSquarePayConfig failed", error);
    return { error: "Could not load card checkout." };
  }
}

export async function startSquareCheckout(input: SquareCheckoutCartInput) {
  try {
    return await createPendingSquareOrder(input);
  } catch (error) {
    console.error("startSquareCheckout failed", error);
    return { error: "Could not start card checkout." };
  }
}

export async function completeSquareCheckout(input: {
  orderId: string;
  sourceId: string;
}) {
  try {
    return await chargeAndFulfillSquareOrder(input.orderId, input.sourceId);
  } catch (error) {
    console.error("completeSquareCheckout failed", error);
    return { error: "Card payment failed." };
  }
}

/** Wallet path: tokenize first, then create order + charge in one server call. */
export async function completeSquareWalletCheckout(
  input: SquareCheckoutCartInput & { sourceId: string },
) {
  try {
    const started = await createPendingSquareOrder(input);
    if ("error" in started && started.error) {
      return { error: started.error };
    }
    if (!("orderId" in started) || !started.orderId) {
      return { error: "Could not start card checkout." };
    }
    return await chargeAndFulfillSquareOrder(started.orderId, input.sourceId);
  } catch (error) {
    console.error("completeSquareWalletCheckout failed", error);
    return { error: "Card payment failed." };
  }
}

/** Sandbox helper: unique key fragment when needed by callers. */
export async function squareCheckoutIdempotencyKey(orderId: string) {
  return `vendl-${orderId}-${randomUUID().slice(0, 8)}`;
}
