"use server";

import { chargeOrderBalance } from "@/lib/deposit-order";
import { verifyOrderAccessToken } from "@/lib/order-access-token";

export async function retryBalanceCharge(orderId: string, token: string) {
  if (!verifyOrderAccessToken(orderId, "balance", token)) {
    return { ok: false as const, error: "Invalid or missing link." };
  }
  try {
    return await chargeOrderBalance(orderId);
  } catch (error) {
    console.error("retryBalanceCharge failed", error);
    return { ok: false as const, error: "Could not charge balance." };
  }
}
